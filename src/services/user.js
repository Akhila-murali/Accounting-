import api from "../api";
import { ENDPOINTS } from "../api/apiEndpoints";


export const getUsers = async () => {
  const response = await api.get(ENDPOINTS.REGISTRATION.USERS);
  return response.data;
};


export const getUser = async (userId) => {
  const response = await api.get(ENDPOINTS.REGISTRATION.USER_BY_ID(userId));
  return response.data;
};


export const getRoles = async () => {
  const response = await api.get(ENDPOINTS.REGISTRATION.ROLES);
  return response.data;
};


export const registerUser = async (data) => {
  const payload = {
    fullName: data.fullName || "",
    phoneNumber: data.phoneNumber || "",
    email: data.email || "",
    password: data.password || "",
    role: data.role || ""
  };
  const response = await api.post(ENDPOINTS.REGISTRATION.REGISTER, payload);
  return response.data;
};


export const updateUser = async (userId, data) => {
  const payload = {
    fullName: data.fullName || "",
    phoneNumber: data.phoneNumber || "",
    email: data.email || ""
  };
  const response = await api.put(ENDPOINTS.REGISTRATION.USER_BY_ID(userId), payload);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(ENDPOINTS.REGISTRATION.USER_BY_ID(userId));
  return response.data;
};
