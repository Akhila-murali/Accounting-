import api from '../api';
import { ENDPOINTS } from '../api/apiEndpoints';

export const getQuotationDefaults = async () => {
  const response = await api.get(ENDPOINTS.QUOTATIONS.DEFAULTS);

  return response.data;
};

export const getQuotations = async () => {
  const response = await api.get(ENDPOINTS.QUOTATIONS.BASE);
  return response.data;
};

export const getQuotation = async (id) => {
  const response = await api.get(ENDPOINTS.QUOTATIONS.BY_ID(id));
  return response.data;
};

export const deleteQuotation = async (id) => {
  const response = await api.delete(ENDPOINTS.QUOTATIONS.BY_ID(id));
  return response.data;
};

export const duplicateQuotation = async (id) => {
  const response = await api.post(ENDPOINTS.QUOTATIONS.DUPLICATE(id));
  return response.data;
};

export const createNewDraft = async () => {
  const response = await api.post(
    ENDPOINTS.QUOTATION_DRAFTS.NEW
  );

  return response.data;
};

export const getDraft = async (draftId) => {
  const response = await api.get(
    ENDPOINTS.QUOTATION_DRAFTS.BY_ID(draftId)
  );

  return response.data;
};

export const updateDraft = async (draftId, data) => {
  const response = await api.put(
    ENDPOINTS.QUOTATION_DRAFTS.BY_ID(draftId),
    data
  );

  return response.data;
};

export const commitDraft = async (draftId) => {
  const response = await api.post(
    ENDPOINTS.QUOTATION_DRAFTS.COMMIT(draftId)
  );

  return response.data;
};

export const createEditDraft = async (quotationId) => {
  const response = await api.post(
    ENDPOINTS.QUOTATION_DRAFTS.EDIT(quotationId)
  );

  return response.data;
};

export const applyDraft = async (draftId) => {
  const response = await api.post(
    ENDPOINTS.QUOTATION_DRAFTS.APPLY(draftId)
  );

  return response.data;
};

export const discardDraft = async (draftId) => {
  const response = await api.delete(
    ENDPOINTS.QUOTATION_DRAFTS.BY_ID(draftId)
  );

  return response.data;
};

export const getActiveDrafts = async () => {
  const response = await api.get(
    ENDPOINTS.QUOTATION_DRAFTS.ACTIVE
  );

  return response.data;
};
