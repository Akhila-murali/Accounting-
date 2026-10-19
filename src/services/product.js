import api from '../api';
import { ENDPOINTS } from '../api/apiEndpoints';

export const getProducts = async (search = '') => {
  const response = await api.get(
    ENDPOINTS.PRODUCTS.BASE,
    {
      params: search ? { search } : {},
    }
  );

  return response.data;
};

export const getAllProducts = async () => {
  const response = await api.get(
    ENDPOINTS.PRODUCTS.ALL
  );

  return response.data;
};

export const getProductDeletePreview = async (id) => {
  const response = await api.get(ENDPOINTS.PRODUCTS.DELETE_PREVIEW(id));
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(ENDPOINTS.PRODUCTS.BY_ID(id));
  return response.data;
};

export const createProduct = async (data) => {
  const response = await api.post(
    ENDPOINTS.PRODUCTS.BASE,
    data
  );

  return response.data;
};
