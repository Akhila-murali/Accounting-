import api from '../api';
import { ENDPOINTS } from '../api/apiEndpoints';

export const getDocumentPrefixes = async (config = {}) => {
  const response = await api.get(
    ENDPOINTS.DOCUMENT_SETTINGS.PREFIXES,
    config
  );

  return response.data;
};

export const updateDocumentPrefixes = async (prefixes) => {
  const response = await api.put(
    ENDPOINTS.DOCUMENT_SETTINGS.PREFIXES,
    prefixes
  );

  return response.data;
};
