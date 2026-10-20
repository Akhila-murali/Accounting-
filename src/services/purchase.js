import api from '../api';
import { ENDPOINTS } from '../api/apiEndpoints';

export const getPurchaseLookups = async () => {
  const response = await api.get(
    ENDPOINTS.PURCHASE_BILLS.LOOKUPS
  );

  return response.data;
};

export const createPurchaseDraft = async () => {
  const response = await api.post(
    ENDPOINTS.PURCHASE_DRAFTS.NEW,
    null,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
};

export const getPurchaseDraft = async (draftId) => {
  const response = await api.get(
    ENDPOINTS.PURCHASE_DRAFTS.BY_ID(draftId)
  );

  return response.data;
};

export const getActivePurchaseDrafts = async () => {
  const response = await api.get(
    ENDPOINTS.PURCHASE_DRAFTS.ACTIVE
  );

  return response.data;
};

export const updatePurchaseDraft = async (
  draftId,
  data
) => {
  const response = await api.put(
    ENDPOINTS.PURCHASE_DRAFTS.BY_ID(draftId),
    data
  );

  return response.data;
};

export const commitPurchaseDraft = async (draftId) => {
  const response = await api.post(
    ENDPOINTS.PURCHASE_DRAFTS.COMMIT(draftId)
  );

  return response.data;
};

export const discardPurchaseDraft = async (draftId) => {
  const response = await api.delete(
    ENDPOINTS.PURCHASE_DRAFTS.BY_ID(draftId)
  );

  return response.data;
};

export const getPurchases = async () => {
  const response = await api.get(
    ENDPOINTS.PURCHASE_BILLS.BASE
  );

  return response.data;
};

export const getPurchase = async (id) => {
  const response = await api.get(
    ENDPOINTS.PURCHASE_BILLS.BY_ID(id)
  );

  return response.data;
};

export const completePurchase = async (id) => {
  const response = await api.post(
    ENDPOINTS.PURCHASE_BILLS.COMPLETE(id)
  );

  return response.data;
};

export const createPurchaseEditDraft = async (purchaseBillId) => {
  const response = await api.post(
    ENDPOINTS.PURCHASE_DRAFTS.EDIT(purchaseBillId)
  );

  return response.data;
};

export const getPurchaseApplyPreview = async (draftId) => {
  const response = await api.post(
    ENDPOINTS.PURCHASE_DRAFTS.APPLY_PREVIEW(draftId)
  );

  return response.data;
};

export const applyPurchaseDraft = async (draftId, confirmInventoryRestoration) => {
  const response = await api.post(
    ENDPOINTS.PURCHASE_DRAFTS.APPLY(draftId),
    { confirmInventoryRestoration }
  );

  return response.data;
};

export const getPurchaseDeletePreview = async (id) => {
  const response = await api.get(
    ENDPOINTS.PURCHASE_BILLS.DELETE_PREVIEW(id)
  );

  return response.data;
};

export const deletePurchase = async (id) => {
  const response = await api.delete(
    ENDPOINTS.PURCHASE_BILLS.BY_ID(id)
  );

  return response.data;
};

export const deletePurchaseAttachment = async (
  purchaseBillId,
  attachmentId
) => {
  const response = await api.delete(
    ENDPOINTS.PURCHASE_BILLS.DELETE_ATTACHMENT(
      purchaseBillId,
      attachmentId
    )
  );

  return response.data;
};

export const uploadPurchaseAttachment = async (purchaseBillId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(
    ENDPOINTS.PURCHASE_BILLS.UPLOAD_ATTACHMENT(purchaseBillId),
    formData
  );

  return response.data;
};

export const getStockSummary = async () => {
  const response = await api.get(
    ENDPOINTS.INVENTORY.STOCK_SUMMARY
  );

  return response.data;
};
