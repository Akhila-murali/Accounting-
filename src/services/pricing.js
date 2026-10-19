import api from '../api';
import { ENDPOINTS } from '../api/apiEndpoints';

export const getGstSlabs = async () => {
  const response = await api.get(ENDPOINTS.PRICING.GST_SLABS);
  return response.data;
};

export const getPricingPreview = async (pricing) => {
  const response = await api.put(ENDPOINTS.PRICING.PREVIEW, pricing);
  return response.data;
};