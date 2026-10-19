import api from '../api';
import { ENDPOINTS } from '../api/apiEndpoints';

export const getStockSummary = async () => {
  const response = await api.get(ENDPOINTS.INVENTORY.STOCK_SUMMARY);
  return response.data;
};

export const getStockPurchaseHistory = async (itemKey) => {
  const response = await api.get(ENDPOINTS.INVENTORY.STOCK_PURCHASES(itemKey));
  return response.data;
};

export const getManufacturingMaterials = async (
  purchaseBillId,
  itemKey
) => {
  const response = await api.get(
    ENDPOINTS.INVENTORY.STOCK_UNITS,
    {
      params: {
        purchaseBillId,
        itemKey,
      },
    }
  );

  return response.data;
};
