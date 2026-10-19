import api from '../api';
import { ENDPOINTS } from '../api/apiEndpoints';

export const getExpenseLookups = async () => {
  const response = await api.get(ENDPOINTS.EXPENSES.LOOKUPS);
  return response.data;
};

export const createExpense = async (data) => {
  const response = await api.post(ENDPOINTS.EXPENSES.BASE, data);
  return response.data;
};

export const getExpenses = async () => {
  const response = await api.get(ENDPOINTS.EXPENSES.BASE);
  return response.data;
};

export const getExpense = async (id) => {
  const response = await api.get(ENDPOINTS.EXPENSES.BY_ID(id));
  return response.data;
};

export const updateExpense = async (id, data) => {
  const response = await api.put(ENDPOINTS.EXPENSES.BY_ID(id), data);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await api.delete(ENDPOINTS.EXPENSES.BY_ID(id));
  return response.data;
};
