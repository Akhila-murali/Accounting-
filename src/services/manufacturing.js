import api from '../api';
import { ENDPOINTS } from '../api/apiEndpoints';


export const createManufacturing = async (data) => {
  const response = await api.post(
    ENDPOINTS.MANUFACTURING.BASE,
    data
  );

  return response.data;
};


export const getManufacturingStockSummary = async () => {
  const response = await api.get(
    ENDPOINTS.MANUFACTURING.STOCK_SUMMARY
  );

  return response.data;
};

export const getManufacturingBatches = async (productName) => {
  const response = await api.get(
    ENDPOINTS.MANUFACTURING.BATCHES(productName)
  );

  return response.data;
};

export const getManufacturedStockUnits = async (manufacturingId) => {
  const response = await api.get(
    ENDPOINTS.MANUFACTURING.STOCK_UNITS(manufacturingId),
    { params: { availableOnly: true } }
  );

  return response.data;
};
