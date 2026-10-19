import api from "../api"; // index.js automatically attaches interceptors to the api instance
import { ENDPOINTS } from "../api/apiEndpoints";

export const getCompanies = async () => {
  const response = await api.get(ENDPOINTS.COMPANIES.BASE);
  return response.data;
};


export const getCompany = async (id) => {
  const response = await api.get(ENDPOINTS.COMPANIES.BY_ID(id));
  return response.data;
};


export const createCompany = async (data) => {
  const payload = {
    companyName: data.companyName || null,
    address: data.address || null,
    city: data.city || null,
    state: data.state || null,
    country: data.country || null,
    pin: data.pin || null,
    gstNo: data.gstNo || null,
    pan: data.pan || null,
    phoneNumber: data.phoneNumber || null,
    email: data.email || null
  };
  const response = await api.post(ENDPOINTS.COMPANIES.BASE, payload);
  return response.data;
};

export const updateCompany = async (id, data) => {
  const payload = {
    companyName: data.companyName || null,
    address: data.address || null,
    city: data.city || null,
    state: data.state || null,
    country: data.country || null,
    pin: data.pin || null,
    gstNo: data.gstNo || null,
    pan: data.pan || null,
    phoneNumber: data.phoneNumber || null,
    email: data.email || null
  };
  const response = await api.put(ENDPOINTS.COMPANIES.BY_ID(id), payload);
  return response.data;
};

export const deleteCompany = async (id) => {
  const response = await api.delete(ENDPOINTS.COMPANIES.BY_ID(id));
  return response.data;
};
