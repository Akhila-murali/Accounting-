
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Save, X } from 'lucide-react';

import Button from '../../components/common/Button.jsx';
import Toast from '../../components/common/Toast.jsx';
import InvoiceInformation from '../../components/invoice/InvoiceInformation.jsx';
import InvoiceItems from '../../components/invoice/InvoiceItems.jsx';
import InvoiceSummary from '../../components/invoice/InvoiceSummary.jsx';
import InvoiceTerms from '../../components/invoice/InvoiceTerms.jsx';

import { getCompanies } from '../../services/company.js';
import { getGstSlabs } from '../../services/pricing.js';
import { getPurchaseLookups } from '../../services/purchase.js';
import { getQuotations } from '../../services/quotation.js';
import { getDocumentPrefixes } from '../../services/prefix.js';
import { getAllProducts } from '../../services/product.js';
import {
  getProformaInvoiceDraftById,
  updateProformaInvoiceDraft,
  commitProformaInvoiceDraft,
  getProformaInvoice,
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
  quantity: 1,
  unit: 'NONE',
  price: 0,
  tax: 0,
  cess: 0,
});

// Backend ProductUnit enum -> Frontend dropdown
const PRODUCT_UNIT_NAMES = {
  0: 'NONE',
  1: 'PCS',
  2: 'BOX',
  3: 'KG',
  4: 'MTR',
  5: 'LTR',
  6: 'SET',
  7: 'DOZEN',
  8: 'BUNDLE',
};


const restoreInvoiceItem = (item) => {
  const rawUnit = item.unit ?? 0;

  const unit =
    typeof rawUnit === 'number'
      ? PRODUCT_UNIT_NAMES[rawUnit] ?? 'NONE'
      : String(rawUnit).toUpperCase();

  return {
    id: crypto.randomUUID(),
    itemName: item.itemName ?? '',
    serialNumbers: Array.isArray(item.serialNumbers)
      ? item.serialNumbers
      : [],
    description: item.description ?? '',
    partNumber: item.partNumber ?? '',
    quantity: item.quantity ?? 1,
    unit,
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

// Backend PaymentType enum -> Frontend dropdown

const PAYMENT_TYPE_NAMES = {
  1: 'Cash',
  2: 'StrideindBankAccount',
  3: 'UPI',
  4: 'Cheque',
};

const restorePaymentType = (value) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  if (typeof value === 'number') {
    return PAYMENT_TYPE_NAMES[value] ?? '';
  }

  if (/^[1-4]$/.test(String(value))) {
    return PAYMENT_TYPE_NAMES[Number(value)] ?? '';
  }

  return Object.values(PAYMENT_TYPE_NAMES).includes(value)
    ? value
    : '';
};


export default function Invoice() {
  // ============================================
  // Route Information
  // ============================================

  const location = useLocation();
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
  const [documents, setDocuments] = useState([]);

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
  const [saveStatus, setSaveStatus] = useState('saved');
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalizedInvoice, setFinalizedInvoice] = useState(null);
  const [toast, setToast] = useState(null);

  // These refs coordinate manual saving and Autosave.
  const draftSaveInProgress = useRef(false);
  const currentVersionRef = useRef(null);
  const lastSavedContentRef = useRef(null);
  const latestContentRef = useRef(null);
  const failedContentRef = useRef(null);
  const saveDraftRef = useRef(null);
  const activeDraftRef = useRef(null);
  const currentSavePromiseRef = useRef(null);
  const finalizingRef = useRef(false);

  // A stable JSON representation lets us detect actual content changes.
  const contentJson = useMemo(() => {
    if (!isProformaDraft) return null;
    return JSON.stringify(buildProformaDraftContent({
      formData,
      items,
      summary,
      selectedTerms,
    }));
  }, [isProformaDraft, formData, items, summary, selectedTerms]);
  latestContentRef.current = contentJson;

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
          getQuotations(),
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
          Array.isArray(quotationList) ? quotationList : []
        );

        setProducts(
          Array.isArray(productList) ? productList : []
        );

        setPaymentTypes(
          Array.isArray(lookups?.paymentTypes)
            ? lookups.paymentTypes
            : []
        );
      } catch {
        if (cancelled) return;

        setGstSlabs([]);
        setCompanies([]);
        setQuotations([]);
        setProducts([]);
        setPaymentTypes([]);
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
    if (!isProformaDraft) return;

    let cancelled = false;
    activeDraftRef.current = draftId;
    finalizingRef.current = false;
    setIsFinalizing(false);
    setToast(null);
    setFinalizedInvoice(null);
    lastSavedContentRef.current = null;
    currentVersionRef.current = null;
    failedContentRef.current = null;

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

        const content = draft.content;

        if (!content || typeof content !== 'object') {
          throw new Error('Draft content is missing.');
        }

        if (content) {
          // ====================================
          // Restore Invoice Information
          // ====================================

          setFormData((current) => ({
            ...current,
            customerCompanyId:
              content.customerCompanyId == null
                ? ''
                : String(content.customerCompanyId),

            billingName: content.billingName ?? '',
            phoneNo: content.phoneNo ?? '',
            gstNo: content.gstNo ?? '',
            stateOfSupply: content.stateOfSupply ?? '',

            invoiceDate: content.invoiceDate
              ? content.invoiceDate.slice(0, 10)
              : getToday(),

            validityPeriod:
              content.validityPeriod ?? 30,

            description: content.description ?? '',

            paymentType:
              restorePaymentType(content.paymentType),

            proposalReference:
              content.quotationId != null
                ? String(content.quotationId)
                : '',
          }));

          // ====================================
          // Restore Terms & Conditions
          // ====================================

          const restoredTerms =
            Array.isArray(content.termsAndConditions)
              ? content.termsAndConditions.map((term) => ({
                  id:
                    term.termId ??
                    term.id ??
                    crypto.randomUUID(),

                  termId: term.termId ?? null,

                  title: term.title ?? '',

                  bullets: Array.isArray(term.bullets)
                    ? term.bullets
                    : [],
                }))
              : [];

          setSelectedTerms(restoredTerms);

          // ====================================
          // Restore Discount Information
          // ====================================

          setSummary({
            discountValue:
              content.totalDiscountValue ?? 0,

            discountType:
              restoreDiscountType(
                content.totalDiscountType
              ),
          });

          // ====================================
          // Restore Invoice Items
          // ====================================

          const restoredItems = Array.isArray(content.items)
            ? content.items.map(restoreInvoiceItem)
            : [];

          const effectiveItems = restoredItems.length > 0
            ? restoredItems
            : [createInvoiceItem()];
          setItems(effectiveItems);

          // Compare against the restored form, not the empty initial form.
          const restoredContentJson = JSON.stringify(
            buildProformaDraftContent({
              formData: {
                customerCompanyId: content.customerCompanyId == null
                  ? '' : String(content.customerCompanyId),
                billingName: content.billingName ?? '',
                phoneNo: content.phoneNo ?? '',
                gstNo: content.gstNo ?? '',
                stateOfSupply: content.stateOfSupply ?? '',
                invoiceDate: content.invoiceDate
                  ? content.invoiceDate.slice(0, 10) : getToday(),
                validityPeriod: content.validityPeriod ?? 30,
                proposalReference: content.quotationId == null
                  ? '' : String(content.quotationId),
                description: content.description ?? '',
                paymentType: restorePaymentType(content.paymentType),
              },
              items: effectiveItems,
              summary: {
                discountValue: content.totalDiscountValue ?? 0,
                discountType: restoreDiscountType(content.totalDiscountType),
              },
              selectedTerms: restoredTerms,
            })
          );
          lastSavedContentRef.current = restoredContentJson;
          currentVersionRef.current = draft.version;
          setDraftVersion(draft.version);
          setSaveStatus('saved');
        }
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
      if (activeDraftRef.current === draftId) {
        activeDraftRef.current = null;
      }
    };
  }, [draftId, isProformaDraft]);

  useEffect(() => {
    if (!isProformaDetails) return;

    const loadInvoice = async () => {
      try {
        setIsDraftLoading(true);
        const response = await getProformaInvoice(id);
        const invoice = response?.data;

        if (!response?.success || !invoice) {
          throw new Error(response?.message || 'Unable to load proforma invoice.');
        }

        setFormData((current) => ({
          ...current,
          customerCompanyId: invoice.customerCompanyId == null
            ? '' : String(invoice.customerCompanyId),
          billingName: invoice.billingName ?? '',
          phoneNo: invoice.phoneNo ?? '',
          gstNo: invoice.gstNo ?? '',
          stateOfSupply: invoice.stateOfSupply ?? '',
          prefix: invoice.prefix ?? current.prefix,
          invoiceNumber: invoice.invoiceNumber ?? invoice.proformaInvoiceNumber ?? '',
          proposalReference: invoice.quotationId == null
            ? '' : String(invoice.quotationId),
          invoiceDate: invoice.invoiceDate?.slice(0, 10) ?? getToday(),
          validityPeriod: invoice.validityPeriod ?? 30,
          description: invoice.description ?? '',
          paymentType: restorePaymentType(invoice.paymentType),
        }));

        setItems(
          Array.isArray(invoice.items) && invoice.items.length > 0
            ? invoice.items.map(restoreInvoiceItem)
            : [createInvoiceItem()]
        );
        setSelectedTerms(invoice.termsAndConditions || []);
        setSummary({
          discountValue: invoice.totalDiscountValue ?? 0,
          discountType: restoreDiscountType(invoice.totalDiscountType),
        });
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
  }, [id, isProformaDetails]);

  // ============================================
  // Shared Save Logic — Manual Save and Autosave
  // ============================================

  const saveDraft = async ({ manual = false, forCommit = false } = {}) => {
    if (!isProformaDraft || isDraftLoading || draftError || finalizedInvoice) return false;
    if (finalizingRef.current && !forCommit) return false;
    if (draftSaveInProgress.current || currentVersionRef.current === null) return false;

    const snapshot = latestContentRef.current;
    if (!snapshot) return false;
    if (snapshot === lastSavedContentRef.current) return true;
    if (!manual && !forCommit && snapshot === failedContentRef.current) return false;

    const savingDraftId = draftId;
    draftSaveInProgress.current = true;
    setIsDraftSaving(true);
    setSaveStatus('saving');

    const savingPromise = updateProformaInvoiceDraft(
      savingDraftId,
      currentVersionRef.current,
      JSON.parse(snapshot)
    );
    currentSavePromiseRef.current = savingPromise;

    try {
      const response = await savingPromise;
      if (activeDraftRef.current !== savingDraftId) return false;

      /*
        This save uses the version captured when the request began.
        Further edits remain detectable through latestContentRef.
      */
      const updatedVersion = response.data?.version;
      if (!Number.isInteger(updatedVersion)) {
        throw new Error('Updated Draft version was not returned.');
      }

      currentVersionRef.current = updatedVersion;
      lastSavedContentRef.current = snapshot;
      failedContentRef.current = null;
      setDraftVersion(updatedVersion);
      setSaveStatus(
        latestContentRef.current === snapshot ? 'saved' : 'unsaved'
      );
      return true;
    } catch (error) {
      if (activeDraftRef.current !== savingDraftId) return false;
      console.error('Draft save failed:', error);
      failedContentRef.current = snapshot;
      setSaveStatus('unsaved');
      setToast({
        message:
          error.response?.data?.message || error.message || 'Failed to save Draft.',
        type: 'error',
      });
      return false;
    } finally {
      if (currentSavePromiseRef.current === savingPromise) {
        currentSavePromiseRef.current = null;
      }
      draftSaveInProgress.current = false;
      if (activeDraftRef.current === savingDraftId) {
        setIsDraftSaving(false);
      }
    }
  };

  // Timer invokes the current Save function, without retriggering on every render.
  saveDraftRef.current = saveDraft;

  useEffect(() => {
    if (finalizingRef.current || finalizedInvoice) return;
    if (!isProformaDraft || isDraftLoading || draftVersion === null || draftError) return;
    if (contentJson === lastSavedContentRef.current) return;
    if (contentJson === failedContentRef.current) return;

    const timeoutId = setTimeout(() => {
      saveDraftRef.current?.();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [isProformaDraft, isDraftLoading, draftVersion, draftError, contentJson, finalizedInvoice]);

  const handleFinalizeInvoice = async () => {
    if (!isProformaDraft || finalizingRef.current || finalizedInvoice ||
        isDraftLoading || draftError || currentVersionRef.current === null) return;

    // Validate key required fields before making a permanent invoice.
    const content = JSON.parse(latestContentRef.current || '{}');
    if (!Number.isInteger(content.customerCompanyId) || content.customerCompanyId <= 0) {
      setToast({ message: 'Select a customer before finalizing.', type: 'error' });
      return;
    }
    if (!content.invoiceDate || Number(content.validityPeriod) < 1 || Number(content.validityPeriod) > 365) {
      setToast({ message: 'Enter a valid invoice date and validity period (1–365 days).', type: 'error' });
      return;
    }
    if (!Array.isArray(content.items) || content.items.length === 0 ||
        content.items.some((item) => !item.itemName?.trim() || item.itemName.length > 200 ||
          !(item.quantity >= 0.001) || !(item.pricePerUnit >= 0) ||
          !(item.gstPercentage >= 0 && item.gstPercentage <= 100) ||
          !(item.cessPercentage >= 0 && item.cessPercentage <= 100))) {
      setToast({ message: 'Add at least one valid item with name, quantity, price, GST and Cess.', type: 'error' });
      return;
    }
    if (content.termsAndConditions?.some((term) => !term.title?.trim() || term.title.length > 200)) {
      setToast({ message: 'All selected terms must have a valid title.', type: 'error' });
      return;
    }
    if (documents.length > 0) {
      setToast({ message: 'Selected supporting files are not uploaded yet. Remove them or upload them before finalizing.', type: 'error' });
      return;
    }

    finalizingRef.current = true;
    setIsFinalizing(true);
    setToast(null);
    const committingDraftId = draftId;
    try {
      // Wait for a currently running Autosave before taking its next version.
      if (currentSavePromiseRef.current) {
        try { await currentSavePromiseRef.current; } catch { /* handled by saveDraft */ }
        // Let saveDraft finish updating its refs after the response.
        await Promise.resolve();
      }
      if (activeDraftRef.current !== committingDraftId) return;

      // Save the latest form snapshot, bypassing the 2-second debounce.
      if (latestContentRef.current !== lastSavedContentRef.current) {
        const saved = await saveDraft({ manual: true, forCommit: true });
        if (!saved) throw new Error('The latest changes could not be saved. Finalization was cancelled.');
      }
      if (activeDraftRef.current !== committingDraftId ||
          latestContentRef.current !== lastSavedContentRef.current) {
        throw new Error('Unsaved changes remain. Finalization was cancelled.');
      }

      const response = await commitProformaInvoiceDraft(committingDraftId);
      if (activeDraftRef.current !== committingDraftId) return;
      if (!response?.data) throw new Error('Finalized invoice details were not returned.');
      setFinalizedInvoice(response.data);
      setToast({
        message: `Invoice finalized successfully. Number: ${response.data.invoiceNumber ?? response.data.proformaInvoiceNumber ?? 'Generated by backend'}.`,
        type: 'success',
      });
    } catch (error) {
      if (activeDraftRef.current === committingDraftId) {
        setToast({
          message: error.response?.data?.message || error.message || 'Failed to finalize invoice.',
          type: 'error',
        });
      }
    } finally {
      finalizingRef.current = false;
      if (activeDraftRef.current === committingDraftId) setIsFinalizing(false);
    }
  };

  // ============================================
  // Render Invoice Page
  // ============================================



  return (
    <div className="relative flex min-w-0 flex-col gap-5 font-sans text-stone-800">
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

        <div className="hidden items-center gap-3 xl:flex">
          {isProformaDraft && draftVersion !== null && (
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

          <Button variant="outline" icon={X}>
            Cancel
          </Button>

          {!isProformaDraft && !isProformaDetails && (
            <Button icon={Save}>Save</Button>
          )}
          {isProformaDraft && (
            <Button
              icon={Save}
              onClick={handleFinalizeInvoice}
              disabled={isDraftLoading || Boolean(draftError) || draftVersion === null ||
                isFinalizing || Boolean(finalizedInvoice)}
            >
              {isFinalizing ? 'Finalizing...' : 'Finalize Invoice'}
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
      <fieldset disabled={isProformaDetails || (isProformaDraft && (isDraftLoading || isFinalizing || Boolean(finalizedInvoice) || Boolean(draftError)))} className="m-0 min-w-0 border-0 p-0">
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
                onDocumentsChange={setDocuments}
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

      {/* Mobile Action Buttons */}
      <div className="flex gap-2 xl:hidden">
        <Button
          variant="outline"
          className="flex-1"
        >
          Cancel
        </Button>

        {!isProformaDraft && !isProformaDetails && (
          <Button icon={Save} className="flex-1">Save</Button>
        )}
        {isProformaDraft && (
          <Button
            icon={Save}
            className="flex-1"
            onClick={handleFinalizeInvoice}
            disabled={isDraftLoading || Boolean(draftError) || draftVersion === null ||
              isFinalizing || Boolean(finalizedInvoice)}
          >
            {isFinalizing ? 'Finalizing...' : 'Finalize Invoice'}
          </Button>
        )}
      </div>
    </div>
  );
}
