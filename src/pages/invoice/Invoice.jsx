
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Pencil, Save, X } from 'lucide-react';

import Button from '../../components/common/Button.jsx';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal.jsx';
import Toast from '../../components/common/Toast.jsx';
import InvoiceInformation from '../../components/invoice/InvoiceInformation.jsx';
import InvoiceItems from '../../components/invoice/InvoiceItems.jsx';
import InvoiceAttachments from '../../components/invoice/InvoiceAttachments.jsx';
import InvoiceSummary from '../../components/invoice/InvoiceSummary.jsx';
import InvoiceTerms from '../../components/invoice/InvoiceTerms.jsx';

import { getCompanies } from '../../services/company.js';
import { getGstSlabs } from '../../services/pricing.js';
import { getPurchaseLookups } from '../../services/purchase.js';
import { getDocumentPrefixes } from '../../services/prefix.js';
import { getAllProducts } from '../../services/product.js';
import {
  getProformaInvoiceDraftById,
  updateProformaInvoiceDraft,
  commitProformaInvoiceDraft,
  discardProformaInvoiceDraft,
  createProformaInvoiceEditDraft,
  applyProformaInvoiceDraft,
  uploadProformaDraftAttachment,
  getProformaDraftAttachments,
  downloadProformaDraftAttachment,
  deleteProformaDraftAttachment,
  uploadProformaInvoiceAttachment,
  getProformaInvoiceAttachments,
  downloadProformaInvoiceAttachment,
  deleteProformaInvoiceAttachment,
  getProformaInvoice,
  getProformaQuotationReferences,
} from '../../services/proformaInvoice.js';

import { buildProformaDraftContent } from '../../utils/proformaDraftMapper.js';
// ============================================
// Helper Functions
// ============================================

const getToday = () => new Date().toISOString().split('T')[0];

const createInvoiceItem = () => ({
  id: crypto.randomUUID(),
  itemName: '',
  serialNumbers: [],
  description: '',
  partNumber: '',
  hsnSac: '',
  quantity: 1,
  unit: '',
  price: 0,
  tax: 0,
  cess: 0,
});

const restoreLookupValue = (value, options, firstEnumValue) => {
  if (value === null || value === undefined || value === '') return '';

  const directOption = options.find(
    (option) => String(option.value) === String(value)
  );
  if (directOption) return directOption.value;

  const enumIndex = Number(value) - firstEnumValue;
  return Number.isInteger(enumIndex) && options[enumIndex]
    ? options[enumIndex].value
    : '';
};

const restoreInvoiceItem = (item, units) => {
  const rawUnit = item.unit ?? 0;

  return {
    id: crypto.randomUUID(),
    itemName: item.itemName ?? '',
    serialNumbers: Array.isArray(item.serialNumbers)
      ? item.serialNumbers
      : [],
    description: item.description ?? '',
    partNumber: item.partNumber ?? '',
    hsnSac: item.hsnSac ?? item.hsnsac ?? '',
    quantity: item.quantity ?? 1,
    unit: restoreLookupValue(rawUnit, units, 0),
    price: item.pricePerUnit ?? 0,
    tax: item.gstPercentage ?? 0,
    cess: item.cessPercentage ?? 0,
  };
};

// Backend DiscountType enum -> Frontend summary
const restoreDiscountType = (value) => {
  if (value === 2 || value === 'Percentage') {
    return 'Percentage';
  }

  return 'Amount';
};

// Normalize draft and saved-invoice responses into the same form model.
// Keeping this mapping in one place makes loading work like Purchase.jsx.
const restoreInvoiceContent = (
  content,
  {
    savedInvoice = false,
    units = [],
    paymentTypes = [],
    quotations = [],
  } = {}
) => {
  const quotationId = content.quotationId == null
    ? ''
    : String(content.quotationId);
  const hasValidQuotation = quotationId === '' || quotations.some(
    (quotation) => String(quotation.id) === quotationId
  );

  const formData = {
    customerCompanyId: content.customerCompanyId == null ? '' : String(content.customerCompanyId),
    billingName: content.billingName ?? '',
    phoneNo: content.phoneNo ?? '',
    gstNo: content.gstNo ?? '',
    stateOfSupply: content.stateOfSupply ?? '',
    invoiceDate: content.invoiceDate?.slice(0, 10) ?? getToday(),
    validityPeriod: content.validityPeriod ?? 30,
    description: content.description ?? '',
    paymentType:
      restoreLookupValue(content.paymentType, paymentTypes, 1) ||
      (!savedInvoice ? paymentTypes[0]?.value ?? '' : ''),
    proposalReference: hasValidQuotation ? quotationId : '',
  };

  if (savedInvoice) {
    formData.prefix = content.prefix;
    formData.invoiceNumber = content.invoiceNumber ?? content.proformaInvoiceNumber ?? '';
  }

  const items = Array.isArray(content.items) && content.items.length
    ? content.items.map((item) => restoreInvoiceItem(item, units))
    : [createInvoiceItem()];
  const selectedTerms = savedInvoice
    ? (content.termsAndConditions || [])
    : Array.isArray(content.termsAndConditions)
      ? content.termsAndConditions.map((term) => ({
        id: term.termId ?? term.id ?? crypto.randomUUID(),
        termId: term.termId ?? null,
        title: term.title ?? '',
        bullets: Array.isArray(term.bullets) ? term.bullets : [],
      }))
    : [];
  const summary = {
    discountValue: content.totalDiscountValue ?? 0,
    discountType: restoreDiscountType(content.totalDiscountType),
  };
  return { formData, items, selectedTerms, summary };
};

// Return a message instead of mixing validations into the API submission.
const validateInvoiceContent = (content) => {
  if (!Number.isInteger(content.customerCompanyId) || content.customerCompanyId <= 0) {
    return 'Select a customer before finalizing.';
  }
  if (!content.invoiceDate || Number(content.validityPeriod) < 1 || Number(content.validityPeriod) > 365) {
    return 'Enter a valid invoice date and validity period (1–365 days).';
  }
  if (!Array.isArray(content.items) || content.items.length === 0 ||
      content.items.some((item) => !item.itemName?.trim() || item.itemName.length > 200 ||
        !item.hsnSac?.trim() || !(item.quantity >= 0.001) || !(item.pricePerUnit >= 0) ||
        !(item.gstPercentage >= 0 && item.gstPercentage <= 100) ||
        !(item.cessPercentage >= 0 && item.cessPercentage <= 100))) {
    return 'Add at least one valid item with name, HSN/SAC, quantity, price, GST and Cess.';
  }
  for (let index = 0; index < content.items.length; index += 1) {
    const item = content.items[index];
    const rowNumber = index + 1;
    const serialNumbers = (item.serialNumbers || []).filter(
      (serialNumber) => serialNumber.trim() !== ''
    );

    if (serialNumbers.length > Number(item.quantity)) {
      return `Serial numbers cannot exceed quantity in row ${rowNumber}.`;
    }

    if (serialNumbers.length !== Number(item.quantity)) {
      return `Enter ${item.quantity} serial number${Number(item.quantity) === 1 ? '' : 's'} in row ${rowNumber}.`;
    }
  }
  if (content.termsAndConditions?.some((term) => !term.title?.trim() || term.title.length > 200)) {
    return 'All selected terms must have a valid title.';
  }
  return '';
};

const loadAttachments = async (isDraft, targetId) => {
  const response = isDraft
    ? await getProformaDraftAttachments(targetId)
    : await getProformaInvoiceAttachments(targetId);
  const attachments = response?.data ?? response;
  return Array.isArray(attachments) ? attachments : [];
};

export default function Invoice() {
  // ============================================
  // Route Information
  // ============================================

  const location = useLocation();
  const navigate = useNavigate();
  const { draftId, id } = useParams();

  const isProformaDraft =
    location.pathname.startsWith('/proforma-invoices/drafts/') &&
    Boolean(draftId);

  const isSalesInvoice =
    location.pathname.startsWith('/sales-invoices');

  const isProformaDetails =
    location.pathname.startsWith('/proforma-invoices/') &&
    !isProformaDraft &&
    Boolean(id);

  const companyState =
    import.meta.env.VITE_COMPANY_STATE || 'Kerala';

  // ============================================
  // Invoice State
  // ============================================

  const [items, setItems] = useState([createInvoiceItem()]);

  const [gstSlabs, setGstSlabs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedTerms, setSelectedTerms] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [units, setUnits] = useState([]);
  const [areLookupsLoaded, setAreLookupsLoaded] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [isDocumentBusy, setIsDocumentBusy] = useState(false);

  const [summary, setSummary] = useState({
    discountValue: 0,
    discountType: 'Amount',
  });

  const [formData, setFormData] = useState({
    customerCompanyId: '',
    billingName: '',
    phoneNo: '',
    gstNo: '',
    stateOfSupply: '',
    prefix: '',
    invoiceNumber: '',
    piNumber: '',
    proposalReference: '',
    invoiceDate: getToday(),
    validityPeriod: 30,
    description: '',
    paymentType: '',
  });

  // ============================================
  // Draft State
  // ============================================

  const [draftVersion, setDraftVersion] = useState(null);
  const [isDraftLoading, setIsDraftLoading] = useState(false);
  const [draftError, setDraftError] = useState('');
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [isStartingEdit, setIsStartingEdit] = useState(false);
  const [isEditing, setIsEditing] = useState(
    Boolean(location.state?.startEditing)
  );
  const [isEditDraft, setIsEditDraft] = useState(
    Boolean(location.state?.isEditDraft)
  );
  const [sourceInvoiceId, setSourceInvoiceId] = useState(
    location.state?.invoiceId || null
  );
  const [finalizedInvoice, setFinalizedInvoice] = useState(null);
  const [toast, setToast] = useState(location.state?.toast || null);
  const [showEditAttention, setShowEditAttention] = useState(false);

  // ============================================
  // GST Calculation Mode
  // ============================================

  const isSameState =
    formData.stateOfSupply.trim().toLowerCase() ===
    companyState.trim().toLowerCase();

  // ============================================
  // Handle Invoice Information Changes
  // ============================================

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (isProformaDraft) setSaveStatus('unsaved');

    if (name === 'prefix') {
      setFormData((current) => ({
        ...current,
        prefix: value,
      }));

      return;
    }

    if (name === 'customerCompanyId') {
      const customer = companies.find(
        (company) =>
          String(company.id) === String(value)
      );

      setFormData((current) => ({
        ...current,
        customerCompanyId: value,
        phoneNo: customer?.phoneNumber || '',
        gstNo: customer?.gstNo || '',
        stateOfSupply: customer?.state || '',
      }));

      return;
    }

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // ============================================
  // Handle Discount Changes
  // ============================================

  const handleSummaryChange = (event) => {
    const { name, value } = event.target;

    setSummary((current) => ({
      ...current,
      [name]: value,
    }));
    if (isProformaDraft) setSaveStatus('unsaved');
  };

  // ============================================
  // Load Dropdown Options
  // ============================================

  useEffect(() => {
    let cancelled = false;

    const loadOptions = async () => {
      try {
        const [
          gstResponse,
          companyResponse,
          quotationResponse,
          lookupResponse,
          prefixResponse,
          productResponse,
        ] = await Promise.all([
          getGstSlabs(),
          getCompanies(),
          getProformaQuotationReferences(),
          getPurchaseLookups(),
          getDocumentPrefixes(),
          getAllProducts(),
        ]);

        if (cancelled) return;

        const slabs = gstResponse?.data ?? gstResponse;
        const companyList =
          companyResponse?.data ?? companyResponse;
        const quotationList =
          quotationResponse?.data ?? quotationResponse;
        const lookups =
          lookupResponse?.data ?? lookupResponse;
        const savedPrefixes = prefixResponse?.data ?? {};
        const productList = productResponse?.data ?? productResponse;

        const prefix = isSalesInvoice
          ? savedPrefixes.sale
          : savedPrefixes.proformaInvoice;

        if (prefix && !isProformaDetails) {
          setFormData((current) => ({
            ...current,
            prefix,
          }));
        }

        setGstSlabs(
          Array.isArray(slabs) ? slabs : []
        );

        setCompanies(
          Array.isArray(companyList) ? companyList : []
        );

        setQuotations(
          Array.isArray(quotationList)
            ? quotationList.map((quotation) => ({
                id: quotation.id,
                proposalReference: quotation.proposalReference,
              }))
            : []
        );

        setProducts(
          Array.isArray(productList) ? productList : []
        );

        const availablePaymentTypes = Array.isArray(lookups?.paymentTypes)
          ? lookups.paymentTypes
          : [];
        setPaymentTypes(availablePaymentTypes);

        if (!isProformaDetails && availablePaymentTypes.length > 0) {
          setFormData((current) => ({
            ...current,
            paymentType:
              current.paymentType || availablePaymentTypes[0].value,
          }));
        }
        setUnits(
          Array.isArray(lookups?.units)
            ? lookups.units
            : []
        );
      } catch {
        if (cancelled) return;

        setGstSlabs([]);
        setCompanies([]);
        setQuotations([]);
        setProducts([]);
        setPaymentTypes([]);
        setUnits([]);
      } finally {
        if (!cancelled) setAreLookupsLoaded(true);
      }
    };

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, [isProformaDetails, isSalesInvoice]);

  // ============================================
  // Load Existing Proforma Invoice Draft
  // ============================================

  useEffect(() => {
    if (!isProformaDraft || !areLookupsLoaded) return;

    let cancelled = false;

    const loadDraft = async () => {
      setIsDraftLoading(true);
      setDraftError('');
      setDraftVersion(null);

      try {
        const response =
          await getProformaInvoiceDraftById(draftId);

        if (cancelled) return;

        const draft = response.data;

        if (!draft || draft.status !== 'Active') {
          throw new Error('Active draft not found.');
        }

        const draftType = String(draft.draftType || '').toLowerCase();
        setIsEditDraft(
          Boolean(location.state?.isEditDraft) ||
          draftType.includes('edit') ||
          Boolean(draft.invoiceId || draft.proformaInvoiceId || draft.sourceInvoiceId)
        );
        setSourceInvoiceId(
          draft.proformaInvoiceId ?? draft.invoiceId ?? draft.sourceInvoiceId ??
          location.state?.invoiceId ?? null
        );

        const content = draft.content;

        if (!content || typeof content !== 'object') {
          throw new Error('Draft content is missing.');
        }

        const attachmentList = await loadAttachments(true, draftId);
        if (cancelled) return;
        setDocuments(attachmentList);

        const restored = restoreInvoiceContent(content, {
          units,
          paymentTypes,
          quotations,
        });
        setFormData((current) => ({ ...current, ...restored.formData }));
        setItems(restored.items);
        setSelectedTerms(restored.selectedTerms);
        setSummary(restored.summary);

        setDraftVersion(draft.version);
        setSaveStatus('');
      } catch (error) {
        if (!cancelled) {
          setDraftError(
            error.response?.data?.message ||
            error.message ||
            'Unable to load Proforma Invoice Draft.'
          );
          setToast({
            message:
              error.response?.data?.message ||
              error.message ||
              'Unable to load Proforma Invoice Draft.',
            type: 'error',
          });
        }
      } finally {
        if (!cancelled) {
          setIsDraftLoading(false);
        }
      }
    };

    loadDraft();

    return () => {
      cancelled = true;
    };
  }, [
    draftId,
    isProformaDraft,
    location.state,
    areLookupsLoaded,
    units,
    paymentTypes,
    quotations,
  ]);

  const handleDocumentsAdd = async (files) => {
    if ((!isProformaDraft && !isProformaDetails) || files.length === 0) return;

    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const invalidFile = files.find((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return !allowedExtensions.includes(extension) || file.size > 10 * 1024 * 1024;
    });

    if (invalidFile) {
      setToast({
        message: 'Only PDF, JPG, JPEG or PNG files up to 10 MiB are allowed.',
        type: 'error',
      });
      return;
    }

    try {
      setIsDocumentBusy(true);
      for (const file of files) {
        const response = isProformaDraft
          ? await uploadProformaDraftAttachment(draftId, file)
          : await uploadProformaInvoiceAttachment(id, file);
        if (response?.success === false) {
          throw new Error(response.message || `Failed to upload ${file.name}.`);
        }
      }

      setDocuments(await loadAttachments(
        isProformaDraft,
        isProformaDraft ? draftId : id
      ));
      setToast({ message: 'Supporting document uploaded successfully.', type: 'success' });
    } catch (error) {
      setToast({
        message: error.response?.data?.message || error.message || 'Failed to upload supporting document.',
        type: 'error',
      });
    } finally {
      setIsDocumentBusy(false);
    }
  };

  const handleDocumentDownload = async (attachment) => {
    const attachmentId = attachment.id ?? attachment.attachmentId;
    if (!attachmentId) return;

    try {
      setIsDocumentBusy(true);
      const file = isProformaDraft
        ? await downloadProformaDraftAttachment(draftId, attachmentId)
        : await downloadProformaInvoiceAttachment(id, attachmentId);
      const fileName = attachment.originalFileName ?? attachment.fileName ?? attachment.name ?? 'attachment';
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setToast({
        message: error.response?.data?.message || error.message || 'Failed to download attachment.',
        type: 'error',
      });
    } finally {
      setIsDocumentBusy(false);
    }
  };

  const handleDocumentDelete = async (attachment) => {
    const attachmentId = attachment.id ?? attachment.attachmentId;
    if (!attachmentId) return;

    try {
      setIsDocumentBusy(true);
      const response = isProformaDraft
        ? await deleteProformaDraftAttachment(draftId, attachmentId)
        : await deleteProformaInvoiceAttachment(id, attachmentId);
      if (response?.success === false) {
        throw new Error(response.message || 'Failed to delete attachment.');
      }

      setDocuments((current) => current.filter((file) => (
        (file.id ?? file.attachmentId) !== attachmentId
      )));
      setToast({ message: response?.message || 'Attachment deleted successfully.', type: 'success' });
    } catch (error) {
      setToast({
        message: error.response?.data?.message || error.message || 'Failed to delete attachment.',
        type: 'error',
      });
    } finally {
      setIsDocumentBusy(false);
    }
  };

  useEffect(() => {
    if (!isProformaDetails || !areLookupsLoaded) return;

    const loadInvoice = async () => {
      try {
        setIsDraftLoading(true);
        const response = await getProformaInvoice(id);
        const invoice = response?.data;

        if (!response?.success || !invoice) {
          throw new Error(response?.message || 'Unable to load proforma invoice.');
        }


        const restored = restoreInvoiceContent(invoice, {
          savedInvoice: true,
          units,
          paymentTypes,
          quotations,
        });
        setFormData((current) => ({
          ...current,
          ...restored.formData,
          prefix: restored.formData.prefix ?? current.prefix,
        }));
        setItems(restored.items);
        setSelectedTerms(restored.selectedTerms);
        setSummary(restored.summary);

        setDocuments(await loadAttachments(false, id));
      } catch (error) {
        setDraftError(error.response?.data?.message || error.message || 'Unable to load proforma invoice.');
        setToast({
          message: error.response?.data?.message || error.message || 'Unable to load proforma invoice.',
          type: 'error',
        });
      } finally {
        setIsDraftLoading(false);
      }
    };

    loadInvoice();
  }, [
    id,
    isProformaDetails,
    areLookupsLoaded,
    units,
    paymentTypes,
    quotations,
  ]);

  // ============================================
  // Save Draft — shared by Autosave and Finalize
  // ============================================

  const saveDraft = async (showError = false) => {
    if (
      !isProformaDraft ||
      isDraftLoading ||
      isDraftSaving ||
      draftError ||
      finalizedInvoice ||
      draftVersion === null
    ) {
      return false;
    }

    try {
      setIsDraftSaving(true);
      setSaveStatus('saving');

      const content = buildProformaDraftContent({
        formData,
        items,
        summary,
        selectedTerms,
        units,
        paymentTypes,
        quotations,
      });
      const response = await updateProformaInvoiceDraft( // draft saving 
        draftId,
        draftVersion,
        content
      );

      if (!response?.success || !response.data) {
        throw new Error(response?.message || 'Failed to save draft.');
      }

      const updatedVersion = response.data.version;
      if (!Number.isInteger(updatedVersion)) {
        throw new Error('Updated draft version was not returned.');
      }

      setDraftVersion(updatedVersion);
      setSaveStatus('saved');
      return true;
    } catch (error) {
      console.error('Draft save failed:', error);
      setSaveStatus('unsaved');

      if (showError) {
        setToast({
          message:
            error.response?.data?.message || error.message || 'Failed to save draft.',
          type: 'error',
        });
      }

      return false;
    } finally {
      setIsDraftSaving(false);
    }
  };

  useEffect(() => {
    if (
      saveStatus !== 'unsaved' ||
      !isProformaDraft ||
      !isEditing ||
      isDraftLoading ||
      isDraftSaving ||
      isFinalizing ||
      isCancelling ||
      showDiscardConfirm ||
      finalizedInvoice ||
      draftVersion === null ||
      draftError
    ) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      saveDraft();
    }, 2000);

    return () => {
      window.clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData,
    items,
    summary,
    selectedTerms,
    saveStatus,
    isProformaDraft,
    isEditing,
    isDraftLoading,
    isDraftSaving,
    isFinalizing,
    isCancelling,
    showDiscardConfirm,
    finalizedInvoice,
    draftVersion,
    draftError,
  ]);

  const handleCancel = async () => {
    if (isProformaDraft) {
      const isUntouchedNewDraft =
        Boolean(location.state?.startEditing) &&
        !isEditDraft &&
        saveStatus === '';

      if (isUntouchedNewDraft) {
        try {
          setIsCancelling(true);
          const response = await discardProformaInvoiceDraft(draftId);

          if (response?.success === false) {
            throw new Error(response.message || 'Failed to discard draft.');
          }

          navigate('/proforma-invoices');
        } catch (error) {
          setToast({
            message: error.response?.data?.message || error.message || 'Failed to discard draft.',
            type: 'error',
          });
        } finally {
          setIsCancelling(false);
        }

        return;
      }

      setShowDiscardConfirm(true);
      return;
    }

    navigate(isSalesInvoice ? '/sales-invoices' : '/proforma-invoices');
  };

  const handleDiscardDraft = async () => {
    if (!isProformaDraft || isDraftSaving || isCancelling) return;

    try {
      setIsCancelling(true);

      const response = await discardProformaInvoiceDraft(draftId);
      if (response?.success === false) {
        throw new Error(response.message || 'Failed to discard draft.');
      }

      setShowDiscardConfirm(false);
      navigate('/proforma-invoices');
    } catch (error) {
      setToast({
        message: error.response?.data?.message || error.message || 'Failed to discard draft.',
        type: 'error',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleStartEditing = async () => {
    if (!isProformaDetails || isStartingEdit) return;

    try {
      setIsStartingEdit(true);
      setToast(null);
      const response = await createProformaInvoiceEditDraft(id);

      if (!response?.success || !response.data) {
        throw new Error(response?.message || 'Unable to start editing this invoice.');
      }

      const editDraftId = response.data.draftId ?? response.data.id;
      if (!editDraftId) {
        throw new Error('Edit Draft ID was not returned by the backend.');
      }

      navigate(`/proforma-invoices/drafts/${editDraftId}`, {
        state: { isEditDraft: true, startEditing: true, invoiceId: id },
      });
    } catch (error) {
      setToast({
        message: error.response?.data?.message || error.message || 'Unable to start editing this invoice.',
        type: 'error',
      });
    } finally {
      setIsStartingEdit(false);
    }
  };

  const handleReadOnlyInteraction = (event) => {
    const canPromptEdit =
      isProformaDetails ||
      (isProformaDraft && !isEditing && !finalizedInvoice);

    if (!canPromptEdit || isStartingEdit) return;
    if (event.target.closest('[data-edit-invoice-button]')) return;

    setShowEditAttention(true);
    setToast({
      message: 'Click Edit to make changes.',
      type: 'info',
    });
  };

  const handleFinalizeInvoice = async () => {
    if (!isProformaDraft || isFinalizing || isDraftSaving || finalizedInvoice ||
        isDraftLoading || draftError || draftVersion === null) return;

    const content = buildProformaDraftContent({
      formData,
      items,
      summary,
      selectedTerms,
      units,
      paymentTypes,
      quotations,
    });
    const validationError = validateInvoiceContent(content);
    if (validationError) {
      setToast({ message: validationError, type: 'error' });
      return;
    }

    setIsFinalizing(true);
    setToast(null);

    try {
      const saved = await saveDraft(true);
      if (!saved) return;

      const response = isEditDraft
        ? await applyProformaInvoiceDraft(draftId)
        : await commitProformaInvoiceDraft(draftId);
      if (!response?.success) {
        throw new Error(response?.message || (isEditDraft
          ? 'Failed to apply invoice changes.'
          : 'Failed to finalize invoice.'));
      }

      const savedInvoiceId = response.data?.id ?? response.data?.invoiceId ??
        response.data?.proformaInvoiceId ?? sourceInvoiceId;
      if (!savedInvoiceId) {
        throw new Error('Saved Proforma Invoice ID was not returned by the backend.');
      }

      const successToast = isEditDraft
        ? { message: response.message || 'Proforma invoice changes applied successfully.', type: 'success' }
        : {
            message: `Invoice finalized successfully. Number: ${response.data?.invoiceNumber ?? response.data?.proformaInvoiceNumber ?? 'Generated by backend'}.`,
            type: 'success',
          };

      setFinalizedInvoice(response.data || { completed: true });
      setIsEditing(false);
      navigate(`/proforma-invoices/${savedInvoiceId}`, {
        replace: true,
        state: { toast: successToast },
      });
    } catch (error) {
      setToast({
        message: error.response?.data?.message || error.message || 'Failed to finalize invoice.',
        type: 'error',
      });
    } finally {
      setIsFinalizing(false);
    }
  };

  // ============================================
  // Render Invoice Page
  // ============================================



  return (
    <div
      className="relative flex min-w-0 flex-col gap-5 font-sans text-stone-800"
      onPointerDownCapture={handleReadOnlyInteraction}
    >
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="m-0 text-2xl font-bold text-stone-900">
            {isSalesInvoice
              ? 'Sales Invoice'
              : 'Proforma Invoice'}
          </h1>

          <p className="mb-0 mt-1 text-sm text-stone-500">
            Create and manage customer{' '}
            {isSalesInvoice ? 'sales' : 'proforma'} invoices.
          </p>
        </div>

        <div className="xl:hidden">
          {isProformaDetails && (
            <Button
              icon={Pencil}
              onClick={handleStartEditing}
              disabled={isDraftLoading || Boolean(draftError) || isStartingEdit}
              data-edit-invoice-button
              className={showEditAttention ? 'edit-invoice-attention' : ''}
              onAnimationEnd={() => setShowEditAttention(false)}
            >
              {isStartingEdit ? 'Opening...' : 'Edit Invoice'}
            </Button>
          )}

          {isProformaDraft && !isEditing && !finalizedInvoice && (
            <Button
              icon={Pencil}
              onClick={() => setIsEditing(true)}
              disabled={isDraftLoading || Boolean(draftError) || draftVersion === null}
              data-edit-invoice-button
              className={showEditAttention ? 'edit-draft-attention' : ''}
              onAnimationEnd={() => setShowEditAttention(false)}
            >
              Edit Draft
            </Button>
          )}
        </div>

        <div className="hidden items-center gap-3 xl:flex">
          {isProformaDraft && isEditing && draftVersion !== null && saveStatus && (
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span
                className={`h-2 w-2 rounded-full ${
                  isDraftSaving ? 'animate-pulse bg-amber-400' : 'bg-brand-gold'
                }`}
              />
              <span>
                {isDraftSaving
                  ? 'Saving draft...'
                  : saveStatus === 'unsaved'
                    ? 'Unsaved changes'
                    : 'Draft saved'}
              </span>
            </div>
          )}

          {(isProformaDraft || isProformaDetails) && (
            <Button
              variant="outline"
              icon={X}
              onClick={handleCancel}
              disabled={isCancelling || isFinalizing || isDraftSaving}
            >
              {isCancelling ? 'Cancelling...' : 'Cancel'}
            </Button>
          )}

          {isProformaDetails && (
            <Button
              icon={Pencil}
              onClick={handleStartEditing}
              disabled={isDraftLoading || Boolean(draftError) || isStartingEdit}
              data-edit-invoice-button
              className={showEditAttention ? 'edit-invoice-attention' : ''}
              onAnimationEnd={() => setShowEditAttention(false)}
            >
              {isStartingEdit ? 'Opening...' : 'Edit Invoice'}
            </Button>
          )}

          {isProformaDraft && !isEditing && !finalizedInvoice && (
            <Button
              icon={Pencil}
              onClick={() => setIsEditing(true)}
              disabled={isDraftLoading || Boolean(draftError) || draftVersion === null}
              data-edit-invoice-button
              className={showEditAttention ? 'edit-draft-attention' : ''}
              onAnimationEnd={() => setShowEditAttention(false)}
            >
              Edit Draft
            </Button>
          )}

          {!isProformaDraft && !isProformaDetails && (
            <Button icon={Save}>Save</Button>
          )}
          {isProformaDraft && isEditing && (
            <Button
              icon={Save}
              onClick={handleFinalizeInvoice}
              disabled={isDraftLoading || Boolean(draftError) || draftVersion === null ||
                isDraftSaving || isFinalizing || Boolean(finalizedInvoice)}
            >
              {isFinalizing
                ? (isEditDraft ? 'Applying...' : 'Finalizing...')
                : (isEditDraft ? 'Apply Changes' : 'Save Invoice')}
            </Button>
          )}
        </div>
      </div>

      {/* Draft Loading */}
      {(isProformaDraft || isProformaDetails) && isDraftLoading && (
        <p
          className="m-0 text-sm text-stone-500"
          role="status"
        >
          Loading Proforma Invoice...
        </p>
      )}

      {/* Invoice Form */}
      <fieldset disabled={isProformaDetails || (isProformaDraft && (!isEditing || isDraftLoading || isFinalizing || Boolean(finalizedInvoice) || Boolean(draftError)))} className="m-0 min-w-0 border-0 p-0">
        <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">

          <div className="contents xl:order-1 xl:col-start-1 xl:row-start-1 xl:flex xl:min-w-0 xl:flex-col xl:gap-4">
            <div className="order-1 min-w-0">
              <InvoiceInformation
                formData={formData}
                companies={companies}
                quotations={quotations}
                isSalesInvoice={isSalesInvoice}
                onChange={handleChange}
              />
            </div>

            <div className="order-2 min-w-0">
              <InvoiceItems
                items={items}
                products={products}
                onItemsChange={(value) => {
                  setItems(value);
                  if (isProformaDraft) setSaveStatus('unsaved');
                }}
                gstSlabs={gstSlabs}
                units={units}
                isSameState={isSameState}
              />
            </div>

            <div className="order-4 min-w-0 xl:order-3">
              <InvoiceTerms
                selectedTerms={selectedTerms}
                onTermsChange={(value) => {
                  setSelectedTerms(value);
                  if (isProformaDraft) setSaveStatus('unsaved');
                }}
                description={formData.description}
                paymentType={formData.paymentType}
                paymentTypes={paymentTypes}
                documents={documents}
                onFieldChange={handleChange}
                onDocumentsAdd={handleDocumentsAdd}
                onDocumentDownload={handleDocumentDownload}
                onDocumentDelete={handleDocumentDelete}
                isDocumentBusy={isDocumentBusy}
                showDocuments={!isProformaDetails}
              />
            </div>
          </div>

          <div className="order-3 min-w-0 xl:order-2 xl:col-start-2 xl:row-start-1">
            <InvoiceSummary
              items={items}
              discountValue={summary.discountValue}
              discountType={summary.discountType}
              isSameState={isSameState}
              onDiscountChange={handleSummaryChange}
            />
          </div>
        </div>
      </fieldset>

      {isProformaDetails && (
        <section className="rounded-xl border border-stone-200 bg-white p-4">
          <InvoiceAttachments
            documents={documents}
            onAdd={handleDocumentsAdd}
            onDownload={handleDocumentDownload}
            onDelete={handleDocumentDelete}
            isBusy={isDocumentBusy}
          />
        </section>
      )}

      {/* Mobile Action Buttons */}
      <div className="flex gap-2 xl:hidden">
        {(isProformaDraft || isProformaDetails) && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCancel}
            disabled={isCancelling || isFinalizing || isDraftSaving}
          >
            {isCancelling ? 'Cancelling...' : 'Cancel'}
          </Button>
        )}

        {isProformaDetails && (
          <Button
            icon={Pencil}
            onClick={handleStartEditing}
            disabled={isDraftLoading || Boolean(draftError) || isStartingEdit}
            data-edit-invoice-button
            className={`flex-1 ${showEditAttention ? 'edit-invoice-attention' : ''}`}
            onAnimationEnd={() => setShowEditAttention(false)}
          >
            {isStartingEdit ? 'Opening...' : 'Edit Invoice'}
          </Button>
        )}

        {isProformaDraft && !isEditing && !finalizedInvoice && (
          <Button
            icon={Pencil}
            onClick={() => setIsEditing(true)}
            disabled={isDraftLoading || Boolean(draftError) || draftVersion === null}
            data-edit-invoice-button
            className={`flex-1 ${showEditAttention ? 'edit-draft-attention' : ''}`}
            onAnimationEnd={() => setShowEditAttention(false)}
          >
            Edit Draft
          </Button>
        )}

        {!isProformaDraft && !isProformaDetails && (
          <Button icon={Save} className="flex-1">Save</Button>
        )}
        {isProformaDraft && isEditing && (
          <Button
            icon={Save}
            className="flex-1"
            onClick={handleFinalizeInvoice}
            disabled={isDraftLoading || Boolean(draftError) || draftVersion === null ||
              isDraftSaving || isFinalizing || Boolean(finalizedInvoice)}
          >
            {isFinalizing
              ? (isEditDraft ? 'Applying...' : 'Finalizing...')
              : (isEditDraft ? 'Apply Changes' : 'Save Invoice')}
          </Button>
        )}
      </div>

      {showDiscardConfirm && (
        <DeleteConfirmationModal
          tone="brand"
          title="Cancel Proforma Invoice"
          message="All changes saved in this draft and its temporary attachments will be permanently removed. Do you want to continue?"
          cancelLabel="Keep Editing"
          confirmLabel="Discard Draft"
          submittingLabel="Discarding..."
          isDeleting={isCancelling}
          onCancel={() => setShowDiscardConfirm(false)}
          onConfirm={handleDiscardDraft}
        />
      )}
    </div>
  );
}
