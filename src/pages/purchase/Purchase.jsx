import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Pencil, Save, X } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal.jsx';
import Toast from '../../components/common/Toast.jsx';
import SerialNumberModal from '../../components/common/bills/SerialNumberModal.jsx';
import PurchaseInformation from '../../components/purchase/PurchaseInformation.jsx';
import PurchaseItems from '../../components/purchase/PurchaseItems.jsx';
import PurchaseTerms from '../../components/purchase/PurchaseTerms.jsx';
import PurchaseSummary from '../../components/purchase/PurchaseSummary.jsx';
import { getCompanies, getCompany } from '../../services/company.js';
import { getGstSlabs } from '../../services/pricing.js';
 
import {
  getPurchaseLookups,
  createPurchaseDraft,
  getPurchaseDraft,
  updatePurchaseDraft,
  commitPurchaseDraft,
  createPurchaseEditDraft,
  applyPurchaseDraft,
  getPurchaseApplyPreview,
  discardPurchaseDraft,
  getPurchase,
  completePurchase,
  deletePurchaseAttachment,
  uploadPurchaseAttachment,
} from '../../services/purchase.js';
 
 
const getToday = () => {
  const today = new Date();
 
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
 
  return `${year}-${month}-${day}`;
};
 
 
const createEmptyItem = (gstSlabId = '') => {
  return {
    id: crypto.randomUUID(),
    stockUnitId: null,
    itemName: '',
    hsnsac: '',
    quantity: 1,
    unit: '',
    pricePerUnit: 0,
    sellingPricePerUnit: 0,
    discountType: 'Amount',
    discountValue: 0,
    gstSlabId,
    serialNumbers: [],
  };
};
 
 
const initialFormState = {
  supplierCompanyId: '',
  phoneNo: '',
  gstNo: '',
  poNo: '',
  poDate: getToday(),
  piNo: '',
  piDate: getToday(),
  eWayBillNo: '',
  billNumber: '',
  billDate: getToday(),
  paymentTerms: '',
  dueDate: '',
  paymentType: '',
  stateOfSupply: '',
  totalDiscountType: 'Amount',
  totalDiscountValue: 0,
};
 
 
const toApiDate = (date) => {
  if (!date) {
    return null;
  }
 
  return `${date}T00:00:00Z`;
};

const getDueDate = (billDate, paymentTerm, paymentTerms) => {
  if (!billDate || !paymentTerm) return '';

  const option = paymentTerms.find(
    (item) => String(item.value) === String(paymentTerm)
  );
  const term = `${option?.value || paymentTerm} ${option?.label || ''}`.toLowerCase();

  if (term.includes('custom')) return '';

  const dayMatch = term.match(/\d+/);
  if (!dayMatch) return '';

  const days = Number(dayMatch[0]);
  const date = new Date(`${billDate}T00:00:00`);
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
 
 
export default function Purchase() {
  const navigate = useNavigate();
  const { id: selectedPurchaseId } = useParams();
  const [searchParams] = useSearchParams();
const selectedDraftId = searchParams.get('draftId');
const fromInventory = searchParams.get('from') === 'inventory';
 
  const [isEditing, setIsEditing] = useState(!selectedPurchaseId && !selectedDraftId);
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseLookups, setPurchaseLookups] = useState({
    paymentTerms: [],
    paymentTypes: [],
    units: [],
  });
  const [gstSlabs, setGstSlabs] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [items, setItems] = useState([createEmptyItem()]);
  const [selectedTerms, setSelectedTerms] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [showSerialModal, setShowSerialModal] = useState(false);
  const [draftId, setDraftId] = useState(null);
  const [draftVersion, setDraftVersion] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [applyPreview, setApplyPreview] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [billFiles, setBillFiles] = useState([]);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [pendingQuantityChange, setPendingQuantityChange] = useState(null);
 
  const [toast, setToast] = useState(null);
  const [validationMessage, setValidationMessage] = useState('');
  const [showEditAttention, setShowEditAttention] = useState(false);
 
  const companyState = import.meta.env.VITE_COMPANY_STATE || 'Kerala';
 
 
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };
 
  const loadPurchaseData = async () => {
    try {
      setIsLoading(true);
 
      const companiesResponse = await getCompanies();
 
      if (!companiesResponse?.success) {
        throw new Error(
          companiesResponse?.message ||
            'Failed to load suppliers.'
        );
      }
 
      setSuppliers(
        companiesResponse.data || []
      );
 
      const lookupsResponse =
        await getPurchaseLookups();
 
      if (
        !lookupsResponse?.success ||
        !lookupsResponse.data
      ) {
        throw new Error(
          lookupsResponse?.message ||
            'Failed to load purchase options.'
        );
      }
 
      const lookups = lookupsResponse.data;
 
      setPurchaseLookups({
        paymentTerms: lookups.paymentTerms || [],
        paymentTypes: lookups.paymentTypes || [],
        units:lookups.units || [],
      });
 
      const gstResponse = await getGstSlabs();
 
      if (!gstResponse?.success) {
        throw new Error(
          gstResponse?.message ||
            'Failed to load GST slabs.'
        );
      }
 
      const slabs =gstResponse.data || [];
      const zeroGstSlab = slabs.find(
        (slab) => Number(slab.percentage) === 0
      );
 
      setGstSlabs(slabs);
 
      let content = null;
      let loadedDraftId = null;
      let loadedDraftVersion = null;
 
      if (selectedDraftId) {
        const draftResponse = await getPurchaseDraft(selectedDraftId);
 
        if (
          !draftResponse?.success ||
          !draftResponse.data
        ) {
          throw new Error(
            draftResponse?.message ||
              'Unable to load purchase draft.'
          );
        }
 
        content = draftResponse.data.content;
        loadedDraftId = draftResponse.data.id;
        loadedDraftVersion = draftResponse.data.version;
      } else if (selectedPurchaseId) {
        const purchaseResponse = await getPurchase(selectedPurchaseId);
 
        if (!purchaseResponse?.success || !purchaseResponse.data) {
          throw new Error(
            purchaseResponse?.message || 'Unable to load purchase.'
          );
        }
 
        setAttachments(purchaseResponse.data.attachments || []);
        content = purchaseResponse.data;
      }
 
      if (content) {
        setFormData({
          ...initialFormState,
          ...content,
          supplierCompanyId:
            String(
              content.supplierCompanyId || ''
            ),
          poDate:
            content.poDate?.split('T')[0] || '',
          piDate:
            content.piDate?.split('T')[0] || '',
          billDate:
            content.billDate?.split('T')[0] || '',
          dueDate:
            content.dueDate?.split('T')[0] || '',
        });
 
       setItems(
  (content.items || []).map((item) => ({
    ...item,
    id: crypto.randomUUID(),
  }))
);
 
        setSelectedTerms(
          content.termsAndConditionId
            ? [{ id: content.termsAndConditionId }]
            : []
        );
 
        setDraftId(loadedDraftId);
        setDraftVersion(loadedDraftVersion);
        setSaveStatus('saved');
        setIsEditing(false);
 
        return;
      }
 
      // Set default dropdown values
      setFormData((current) => ({
        ...current,
 
        paymentTerms:
          lookups.paymentTerms?.[0]?.value ||
          '',
 
        paymentType:
          lookups.paymentTypes?.[0]?.value ||
          '',
 
        stateOfSupply: '',
      }));
 
      // Set first empty item
      setItems([
  createEmptyItem(zeroGstSlab?.id || '')
]);
 
      setSaveStatus('');
      setIsEditing(true);
 
    } catch (error) {
      console.error(error);
 
      showToast(
        error.response?.data?.message ||
          error.message ||
          'Failed to load purchase data.',
        'error'
      );
 
    } finally {
      setIsLoading(false);
    }
  };
 
  const handleInputChange = async (event) => {
    setValidationMessage('');
    const { name, value } =
      event.target;
 
    if (name === 'supplierCompanyId') {
     let supplier = suppliers.find(
    (item) => item.id === Number(value)
  );
 
      try {
        const response = await getCompany(value);
 
        if (response?.success && response.data) {
          supplier = response.data;
        }
      } catch (error) {
        console.error('Unable to load supplier details.', error);
      }
 
      setFormData((current) => ({
        ...current,
 
        supplierCompanyId: value,
 
        phoneNo:
          supplier?.phoneNumber || '',
 
        gstNo:
          supplier?.gstNo || '',
 
        stateOfSupply:
          supplier?.state || '',
      }));
 
      setSaveStatus('unsaved');
 
      return;
    }

    if (name === 'paymentTerms' || name === 'billDate') {
      setFormData((current) => {
        const billDate = name === 'billDate' ? value : current.billDate;
        const paymentTerms = name === 'paymentTerms' ? value : current.paymentTerms;

        return {
          ...current,
          [name]: value,
          dueDate: getDueDate(
            billDate,
            paymentTerms,
            purchaseLookups.paymentTerms
          ),
        };
      });

      setSaveStatus('unsaved');
      return;
    }
 
 
    // Normal fields
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
 
    setSaveStatus('unsaved');
  };
 
  const handleAddItem = () => {
  setItems((current) => [
    ...current,
    createEmptyItem(
      gstSlabs.find((slab) => Number(slab.percentage) === 0)?.id || ''
    ),
  ]);
 
  setSaveStatus('unsaved');
};
 
 
  const handleItemChange = (
    id, name, value) => {
    setValidationMessage('');
 
    if (name === 'quantity' && value !== '') {
      const item = items.find((currentItem) => currentItem.id === id);
      const nextQuantity = Number(value);
 
      if (item && nextQuantity >= 0 && nextQuantity < item.serialNumbers.length) {
        const removedSerials = item.serialNumbers
          .slice(nextQuantity)
          .filter((serial) => serial.trim());
 
        if (removedSerials.length > 0) {
          setPendingQuantityChange({
            itemId: id,
            itemName: item.itemName,
            quantity: value,
            removedSerials,
          });
          return;
        }
 
        setItems((current) =>
          current.map((currentItem) =>
            currentItem.id === id
              ? {
                  ...currentItem,
                  quantity: value,
                  serialNumbers: currentItem.serialNumbers.slice(0, nextQuantity),
                }
              : currentItem
          )
        );
        setSaveStatus('unsaved');
        return;
      }
    }
 
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) {
          return item;
        }
 
        return {
          ...item,
          [name]: value,
        };
      })
    );
 
    setSaveStatus('unsaved');
  };
 
  const confirmQuantityChange = () => {
    const nextQuantity = Number(pendingQuantityChange.quantity);
 
    setItems((current) =>
      current.map((item) =>
        item.id === pendingQuantityChange.itemId
          ? {
              ...item,
              quantity: pendingQuantityChange.quantity,
              serialNumbers: item.serialNumbers.slice(0, nextQuantity),
            }
          : item
      )
    );
 
    setPendingQuantityChange(null);
    setSaveStatus('unsaved');
  };

    const handleDeleteItem = (id) => {
    setItems((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );
 
    setSaveStatus('unsaved');
  };
 
  const handleOpenSerials = (itemId) => {
    const selectedItem = items.find((item) => item.id === itemId) ||
      items.find((item) => item.itemName.trim() && Number(item.quantity) > 0);

    if (!selectedItem) return;

    setSelectedItemId(selectedItem.id);
    setShowSerialModal(true);
  };

  const handleSerialsSave = (serialNumbers) => {
    setItems((current) => current.map((item) =>
      item.id === selectedItemId ? { ...item, serialNumbers } : item
    ));
    setSaveStatus('unsaved');
  };
 
 
  const handleTermsChange = (terms) => {
    setValidationMessage('');
    setSelectedTerms(terms);
 
    setSaveStatus('unsaved');
  };
 
  const handleDeleteAttachment = async () => {
    try {
      setIsSaving(true);
      const response = await deletePurchaseAttachment(
        selectedPurchaseId,
        pendingAttachment.id
      );
      if (!response?.success) throw new Error(response?.message);
      setAttachments((current) => current.filter((file) => file.id !== pendingAttachment.id));
      setPendingAttachment(null);
      showToast(response.message || 'Attachment removed successfully.');
    } catch (error) {
      showToast(error.response?.data?.message || error.message || 'Unable to remove attachment.', 'error');
    } finally {
      setIsSaving(false);
    }
  };
 
  const validatePurchase = () => {
    if (!formData.supplierCompanyId) {
      return 'Please select a supplier.';
    }
 
    if (!formData.phoneNo.trim()) {
      return 'Phone number is required.';
    }
 
    if (!formData.poNo.trim()) {
      return 'PO number is required.';
    }
 
    if (!formData.poDate) {
      return 'PO date is required.';
    }

    if (!formData.piNo.trim()) {
      return 'PI number is required.';
    }

    if (!formData.piDate) {
      return 'PI date is required.';
    }
 
 
    if (!formData.billNumber.trim()) {
      return 'Bill number is required.';
    }
 
 
    if (!formData.billDate) {
      return 'Bill date is required.';
    }
 
    if (!formData.eWayBillNo.trim()) {
      return 'E-Way bill number is required.';
    }
 
    if (!formData.paymentTerms) {
      return 'Payment terms are required.';
    }
 
    if (!formData.dueDate) {
      return 'Due date is required.';
    }
 
 
    if (!formData.stateOfSupply) {
      return 'State of supply is required.';
    }
 
 
    if (!formData.paymentType) {
      return 'Payment type is required.';
    }
 
 
    if (items.length === 0) {
      return 'Please add at least one item.';
    }
 
 
    for (
      let index = 0;
      index < items.length;
      index += 1
    ) {
      const item = items[index];
 
      const rowNumber =
        index + 1;
 
      const serials =
        item.serialNumbers.filter(
          (serial) =>
            serial.trim() !== ''
        );
 
 
      if (!item.itemName.trim()) {
        return `Item name is required in row ${rowNumber}.`;
      }
 
      if (!item.hsnsac.trim()) {
        return `HSN/SAC is required in row ${rowNumber}.`;
      }
 
      if (!item.unit) {
        return `Unit is required in row ${rowNumber}.`;
      }
 
 
      if (
        Number(item.quantity) <= 0
      ) {
        return `Quantity must be greater than zero in row ${rowNumber}.`;
      }
 
 
      if (
        Number(item.pricePerUnit) <= 0
      ) {
        return `Purchase price must be greater than zero in row ${rowNumber}.`;
      }
 
 
      if (
        Number(
          item.sellingPricePerUnit
        ) <= 0
      ) {
        return `Selling price must be greater than zero in row ${rowNumber}.`;
      }
 
 
      if (
        Number(item.discountValue) < 0
      ) {
        return `Discount cannot be negative in row ${rowNumber}.`;
      }
 
 
      if (
        item.discountType ===
          'Percentage' &&
        Number(item.discountValue) >
          100
      ) {
        return `Discount cannot exceed 100% in row ${rowNumber}.`;
      }
 
 
      if (
        serials.length >
        Number(item.quantity)
      ) {
        return `Serial numbers cannot exceed quantity in row ${rowNumber}.`;
      }
 
      if (!selectedPurchaseId && serials.length !== Number(item.quantity)) {
        return `Enter ${item.quantity} serial number${Number(item.quantity) === 1 ? '' : 's'} in row ${rowNumber}.`;
      }
 
 
    }
 
    if (
      formData.paymentTerms ===
        'Custom' &&
      formData.dueDate <
        formData.billDate
    ) {
      return 'Due date cannot be before bill date.';
    }
 
 
    return '';
  };
 
  // BUILD BACKEND DATA
  const buildPurchaseContent = () => {
    const purchaseItems =
      items.map((item) => {
        const serialNumbers =
          item.serialNumbers
            .map((serial) =>
              serial.trim()
            )
            .filter(
              (serial) =>
                serial !== ''
            );
 
        return {
          stockUnitId: item.stockUnitId || null,
 
          itemName:
            item.itemName.trim(),
 
          serialNumbers,
 
          hsnsac:
            item.hsnsac.trim(),
 
          quantity:
            Number(item.quantity),
 
          unit:
            item.unit || 'None',
 
          pricePerUnit:
            Number(
              item.pricePerUnit
            ),
 
          sellingPricePerUnit:
            Number(
              item.sellingPricePerUnit
            ),
 
          discountType:
            item.discountType,
 
          discountValue:
            Number(
              item.discountValue || 0
            ),
 
          gstSlabId:
            Number(item.gstSlabId),
        };
      });
 
 
    return {
      supplierCompanyId:
        Number(
          formData.supplierCompanyId
        ),
 
      phoneNo:
        formData.phoneNo || null,
 
      gstNo:
        formData.gstNo || null,
 
      poNo:
        formData.poNo || null,
 
      poDate:
        toApiDate(formData.poDate),

      piNo:
        formData.piNo || null,

      piDate:
        toApiDate(formData.piDate),
 
      eWayBillNo:
        formData.eWayBillNo || null,
 
      billNumber:
        formData.billNumber.trim(),
 
      billDate:
        toApiDate(
          formData.billDate
        ),
 
      paymentTerms:
        formData.paymentTerms ||
        null,
 
      totalDiscountType:
        formData.totalDiscountType ||
        null,
 
      totalDiscountValue:
        Number(
          formData.totalDiscountValue ||
            0
        ),
 
      dueDate:
        toApiDate(
          formData.dueDate
        ),
 
      paymentType:
        formData.paymentType ||
        null,
 
      stateOfSupply:
        formData.stateOfSupply,
 
      termsAndConditionId:
        selectedTerms[0]?.id ||
        null,
 
      items:
        purchaseItems,
    };
  };
 
  const saveDraft = async (
  showValidation = false
) => {
  if (showValidation) {
    const validationError = validatePurchase();

    if (validationError) {
      setValidationMessage(validationError);
      return null;
    }
  }

  try {
      setIsSaving(true);
 
      const content =
        buildPurchaseContent();
 
      let currentDraftId =
        draftId;
 
 
      if (currentDraftId) {
        const updateResponse =
          await updatePurchaseDraft(
            currentDraftId,
            {
              version: draftVersion,
              content,
            }
          );
 
 
        if (
          !updateResponse?.success ||
          !updateResponse.data
        ) {
          throw new Error(
            updateResponse?.message ||
              'Failed to update purchase draft.'
          );
        }
 
 
        setDraftVersion(
          updateResponse.data.version
        );
      } else {
        const createResponse =
          await createPurchaseDraft();
 
 
        if (
          !createResponse?.success ||
          !createResponse.data
        ) {
          throw new Error(
            createResponse?.message ||
              'Failed to create purchase draft.'
          );
        }
 
 
        currentDraftId =
          createResponse.data.id;
 
 
        setDraftId(
          currentDraftId
        );
 
 
        setDraftVersion(
          createResponse.data.version
        );

        const updateResponse =
          await updatePurchaseDraft(
            currentDraftId,
            {
              version: createResponse.data.version,
              content,
            }
          );

        if (
          !updateResponse?.success ||
          !updateResponse.data
        ) {
          throw new Error(
            updateResponse?.message ||
              'Failed to update purchase draft.'
          );
        }

        setDraftVersion(
          updateResponse.data.version
        );
      }
 
      setSaveStatus('saved');
 
      return currentDraftId;
 
    } catch (error) {
      console.error(error);
 
      setSaveStatus('unsaved');
 
 
      if (showValidation) {
        showToast(
          error.response?.data?.message ||
            error.message ||
            'Failed to save purchase.',
          'error'
        );
      }
 
      return null;
 
    } finally {
      setIsSaving(false);
    }
  };
 
 
  const handleConfirmSave = async () => {
    const currentDraftId = selectedPurchaseId
      ? applyPreview?.draftId || draftId
      : await saveDraft(true);  // for ensure latest draft is saved before apply/commit
 
    if (!currentDraftId) {
      setShowSaveConfirm(false);
      return;
    }
 
    try {
      setIsSaving(true);
 
      const commitResponse = selectedPurchaseId
        ? await applyPurchaseDraft(
            currentDraftId,
            Boolean(applyPreview?.requiresInventoryConfirmation)
          )
        : await commitPurchaseDraft(currentDraftId);
 
      if (
        !commitResponse?.success ||
        !commitResponse.data
      ) {
        throw new Error(
          commitResponse?.message ||
            'Failed to save purchase.'
        );
      }
 
      const purchaseBillId =
        commitResponse.data.purchaseBillId ||
        commitResponse.data.id ||
        selectedPurchaseId;

      if (!selectedPurchaseId) {
        if (!purchaseBillId) {
          throw new Error('Purchase was saved, but its ID was not returned.');
        }

        const completeResponse = await completePurchase(purchaseBillId);

        if (!completeResponse?.success) {
          throw new Error(
            completeResponse?.message ||
              'Purchase was saved, but completion failed.'
          );
        }
      }
 
      let attachmentError = '';
 
      if (billFiles.length > 0) {
        if (!purchaseBillId) {
          attachmentError = 'Purchase was saved, but its ID was not returned for bill upload.';
        } else {
          try {
            for (const file of billFiles) {
              const uploadResponse = await uploadPurchaseAttachment(purchaseBillId, file);
              if (!uploadResponse?.success) {
                throw new Error(uploadResponse?.message || `Failed to upload ${file.name}.`);
              }
            }
          } catch (error) {
            attachmentError =
              error.response?.data?.message ||
              error.message ||
              'Purchase was saved, but bill upload failed.';
          }
        }
      }
 
      setBillFiles([]);
 
      setDraftId(null);
      setDraftVersion(null);
      setSaveStatus('saved');
      setApplyPreview(null);
 
      if (attachmentError) {
        showToast(`Purchase saved. ${attachmentError}`, 'error');
        window.setTimeout(() => navigate('/purchase'), 1500);
      } else {
        showToast(
          selectedPurchaseId
            ? 'Purchase updated successfully.'
            : 'Purchase saved successfully.'
        );
 
        navigate('/purchase');
      }
 
    } catch (error) {
      console.error(error);
 
      showToast(
        error.response?.data?.message ||
          error.message ||
          'Failed to save purchase.',
        'error'
      );
 
    } finally {
      setIsSaving(false);
      setShowSaveConfirm(false);
    }
  };
 
 
  const handleOpenSaveConfirm = async () => {
    const validationError =
      validatePurchase();
 
    if (validationError) {
      setValidationMessage(validationError);
 
      return;
    }
 
    setValidationMessage('');
 
    if (selectedPurchaseId) { 
      const currentDraftId = await saveDraft(true);
      if (!currentDraftId) return;
 
      try {
        setIsSaving(true);
        const response = await getPurchaseApplyPreview(currentDraftId); /// for backend try to understand current status 
 
        if (!response?.success || !response.data) {
          throw new Error(response?.message || 'Unable to preview purchase changes.');
        }
 
        setApplyPreview(response.data);
      } catch (error) {
        showToast(
          error.response?.data?.message || error.message || 'Unable to preview purchase changes.',
          'error'
        );
        return;
      } finally {
        setIsSaving(false);
      }
    }
 
    setShowSaveConfirm(true);
  };
 
  const handleStartEditing = async () => { // Not disable in add purchase for id and draftid
    if (!selectedPurchaseId) {
      setIsEditing(true); // for disable fieldset
      return;
    }
 
    try {
      setIsSaving(true);
      const response = await createPurchaseEditDraft(selectedPurchaseId);
 
      if (!response?.success || !response.data) {
        throw new Error(response?.message || 'Unable to start purchase editing.');
      }
 
      setDraftId(response.data.id);
      setDraftVersion(response.data.version);
      setSaveStatus('saved');
      setIsEditing(true);
    } catch (error) {
      showToast(
        error.response?.data?.message || error.message || 'Unable to start purchase editing.',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };
 
  const getApplyConfirmationMessage = () => {
    if (!selectedPurchaseId) {
      return 'This draft will be committed as a purchase bill. Do you want to continue?';
    }
 
    if (applyPreview?.requiresInventoryConfirmation) {
      const deletedItems = (applyPreview.deletedStockUnits || [])
        .map((item) => `• ${item.stockUnitName}${item.serialNumber ? ` — Serial: ${item.serialNumber}` : ''}`)
        .join('\n');
 
      return `${applyPreview.warning || 'Some inventory items were previously removed.'}${deletedItems ? `\n\n${deletedItems}` : ''}\n\nDo you want to restore and apply these changes?`;
    }
 
    if (applyPreview?.hasItemChanges) {
      return applyPreview.warning || 'This purchase contains inventory-related changes. Applying them will update the associated inventory. Do you want to continue?';
    }
 
    return 'Purchase details have changed. Do you want to apply these changes?';
  };
 
 
  const handleCancel = () => {
    if (draftId) {
      setShowDiscardConfirm(true);
      return;
    }

    navigate('/purchase');
  };

  const handleDiscardDraft = async () => {
    if (!draftId || isSaving) return;

    try {
      setIsSaving(true);
      const response = await discardPurchaseDraft(draftId);
 
      if (response?.success === false) {
        throw new Error(
          response.message || 'Failed to discard draft.'
        );
      }
 
      setShowDiscardConfirm(false);
      navigate('/purchase');
    } catch (error) {
      console.error(error);
      showToast(
        error.response?.data?.message ||
          error.message ||
          'Failed to discard draft.',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };
 
  useEffect(() => {
    loadPurchaseData();
  }, [selectedDraftId, selectedPurchaseId]);
 
 useEffect(() => {
  if (
    saveStatus !== 'unsaved' ||
    isLoading ||
    isSaving ||
    showDiscardConfirm ||
    !isEditing
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
  selectedTerms,
  saveStatus,
  isLoading,
  isSaving,
  showDiscardConfirm,
  isEditing,
]);

  const serialProducts = items.filter(
    (item) => item.itemName.trim() && Number(item.quantity) > 0
  );
  const serialProduct = serialProducts.find(
    (item) => item.id === selectedItemId
  );
  const editButtonLabel = selectedDraftId ? 'Edit Draft' : 'Edit Purchase';

  const handleReadOnlyInteraction = (event) => {
    if (isEditing || fromInventory || isLoading || isSaving) return;
    if (event.target.closest('[data-edit-purchase-button]')) return;

    setShowEditAttention(true);
    setToast({
      message: 'Click Edit to make changes.',
      type: 'info',
    });
  };

  return (
    <div
      className="relative flex flex-col gap-5 font-sans text-stone-800"
      onPointerDownCapture={handleReadOnlyInteraction}
    >
 
      <Toast
        toast={toast}
        onClose={() =>
          setToast(null)
        }
      />
 
 
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
 
        <div>
          {(selectedDraftId || selectedPurchaseId) && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-3 inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-xs text-stone-500 hover:text-stone-900 cursor-pointer"
            >
              <ArrowLeft size={15} />
              Back
            </button>
          )}
 
          <h1 className="m-0 text-2xl font-bold text-stone-900">
            {selectedPurchaseId
              ? 'Purchase Details'
              : selectedDraftId
                ? 'Purchase Draft Details'
                : 'Purchase Bill'}
          </h1>
 
          <p className="m-0 mt-1 text-sm text-stone-500">
            Create and manage your purchase bill with ease.
          </p>
        </div>
 
 
        <div className="flex items-center gap-4">
 
          {isEditing && (saveStatus === 'unsaved' || draftId) && (
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span
                className={`h-2 w-2 rounded-full ${
                  isSaving
                    ? 'bg-amber-400 animate-pulse'
                    : !selectedPurchaseId && saveStatus === 'saved' && draftId
                      ? 'bg-emerald-500'
                      : 'bg-amber-400'
                }`}
              />
              <span>
                {isSaving
                  ? 'Saving draft...'
                  : !selectedPurchaseId && saveStatus === 'saved' && draftId
                    ? 'Draft saved'
                    : 'Unsaved changes'}
              </span>
            </div>
          )}
 
          {isEditing ? (
          <div className="hidden gap-2 xl:flex">
 
            <Button
              variant="outline"
              icon={X}
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
 
 
            <Button
              onClick={handleOpenSaveConfirm}
              icon={
                isSaving
                  ? Loader2
                  : Save
              }
              disabled={
                isSaving ||
                isLoading
              }
            >
              {isSaving
                ? 'Saving...'
                : selectedPurchaseId ? 'Apply Changes' : 'Save Purchase'}
            </Button>
 
          </div>
          ) : !fromInventory  ? (
            <Button
              onClick={handleStartEditing}
              icon={isSaving ? Loader2 : Pencil}
              disabled={isSaving || isLoading}
              data-edit-purchase-button
              className={showEditAttention ? 'edit-invoice-attention' : ''}
              onAnimationEnd={() => setShowEditAttention(false)}
            >
              {isSaving ? 'Opening...' : editButtonLabel}
            </Button>
          ) : null}
        </div>
      </div>
 
      <fieldset disabled={!isEditing} className="contents">  
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">

        <div className="contents xl:order-1 xl:col-start-1 xl:row-start-1 xl:flex xl:flex-col xl:gap-4">
        <div className="order-1">
 
          <PurchaseInformation
            formData={formData}
            suppliers={suppliers}
            paymentTerms={
              purchaseLookups.paymentTerms
            }
            onChange={
              handleInputChange
            }
            validationMessage={validationMessage}
          />
 
        </div>
 
        <div className="order-2">
          <PurchaseItems
            items={items}
            units={
              purchaseLookups.units
            }
            gstSlabs={gstSlabs}
            isSameState={
              formData.stateOfSupply ===
              companyState
            }
            onAdd={handleAddItem}
            onChange={
              handleItemChange
            }
            onDelete={
              handleDeleteItem
            }
            onOpenSerials={
              handleOpenSerials
            }
            validationMessage={validationMessage}
          />
 
        </div>
 
 
        <div className="order-4 xl:order-3">
 
          <PurchaseTerms
            selectedTerms={
              selectedTerms
            }
            paymentType={
              formData.paymentType
            }
            paymentTypes={
              purchaseLookups.paymentTypes
            }
            onTermsChange={
              handleTermsChange
            }
            onPaymentTypeChange={
              handleInputChange
            }
            attachments={attachments}
            billFiles={billFiles}
            onBillFilesChange={setBillFiles}
            onDeleteAttachment={setPendingAttachment}
            validationMessage={validationMessage}
          />
 
        </div>

        </div>
 
 
        <div className="order-3 xl:order-2 xl:col-start-2 xl:row-start-1">
 
          <PurchaseSummary
            items={items}
            gstSlabs={gstSlabs}
            isSameState={
              formData.stateOfSupply ===
              companyState
            }
            totalDiscountValue={
              formData.totalDiscountValue
            }
            totalDiscountType={
              formData.totalDiscountType
            }
            onDiscountChange={
              handleInputChange
            }
          />
 
        </div>
 
      </div>
      </fieldset>
 
      {isEditing && (
      <div className="flex gap-2 xl:hidden">
 
        <Button
          variant="outline"
          icon={X}
          className="flex-1"
          onClick={handleCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
 
 
        <Button
          onClick={handleOpenSaveConfirm}
          icon={
            isSaving
              ? Loader2
              : Save
          }
          className="flex-1"
          disabled={
            isSaving ||
            isLoading
          }
        >
          {isSaving
            ? 'Saving...'
            : selectedPurchaseId ? 'Apply Changes' : 'Save Purchase'}
        </Button>
 
      </div>
      )}

      {!isEditing && !fromInventory && (
        <div className="flex gap-2 xl:hidden">
          <Button
            variant="outline"
            icon={X}
            className="flex-1"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            icon={isSaving ? Loader2 : Pencil}
            className={`flex-1 ${showEditAttention ? 'edit-invoice-attention' : ''}`}
            onClick={handleStartEditing}
            disabled={isSaving || isLoading}
            data-edit-purchase-button
            onAnimationEnd={() => setShowEditAttention(false)}
          >
            {isSaving ? 'Opening...' : editButtonLabel}
          </Button>
        </div>
      )}
 
      {showSaveConfirm && (
        <ConfirmationModal
          title={applyPreview?.requiresInventoryConfirmation
            ? 'Inventory Reconciliation Required'
            : selectedPurchaseId ? 'Apply Purchase Changes' : 'Save Purchase'}
          message={getApplyConfirmationMessage()}
          confirmLabel={applyPreview?.requiresInventoryConfirmation
            ? 'Restore & Apply'
            : selectedPurchaseId ? 'Apply Changes' : 'Save Purchase'}
          isSubmitting={isSaving}
          onCancel={() => {
            setShowSaveConfirm(false);
            setApplyPreview(null);
          }}
          onConfirm={handleConfirmSave}
        />
      )}

      {showDiscardConfirm && (
        <DeleteConfirmationModal
          tone="brand"
          title="Cancel Purchase Draft"
          message="All changes saved in this draft will be permanently removed. Do you want to continue?"
          cancelLabel="Keep Editing"
          confirmLabel="Discard Draft"
          submittingLabel="Discarding..."
          isDeleting={isSaving}
          onCancel={() => setShowDiscardConfirm(false)}
          onConfirm={handleDiscardDraft}
        />
      )}

      {showSerialModal && serialProduct && (
        <SerialNumberModal
          key={serialProduct.id}
          productName={serialProduct.itemName}
          quantity={serialProduct.quantity}
          serialNumbers={serialProduct.serialNumbers}
          products={serialProducts.map((item) => ({
            id: item.id,
            name: item.itemName,
          }))}
          selectedProductId={serialProduct.id}
          onProductChange={setSelectedItemId}
          onSave={handleSerialsSave}
          onClose={() => setShowSerialModal(false)}
        />
      )}
 
      {pendingAttachment && (
        <ConfirmationModal
          title="Remove Attachment"
          message={`Remove ${pendingAttachment.originalFileName}?`}
          confirmLabel="Remove"
          isSubmitting={isSaving}
          onCancel={() => setPendingAttachment(null)}
          onConfirm={handleDeleteAttachment}
        />
      )}
 
      {pendingQuantityChange && (
        <ConfirmationModal
          title="Reduce Quantity?"
          message={`Reducing ${pendingQuantityChange.itemName || 'this item'} to ${pendingQuantityChange.quantity} will remove the following serial number${pendingQuantityChange.removedSerials.length > 1 ? 's' : ''}:\n\n${pendingQuantityChange.removedSerials.join('\n')}\n\nDo you want to continue?`}
          confirmLabel="Remove & Continue"
          isSubmitting={false}
          onCancel={() => setPendingQuantityChange(null)}
          onConfirm={confirmQuantityChange}
        />
      )}
 
    </div>
  );
}
 
 
