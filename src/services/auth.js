import api from "../api";
import { ENDPOINTS } from "../api/apiEndpoints";
import { setAccessToken, clearToken } from "../utils/token";


export const login = async (email, password) => {
  const response = await api.post(ENDPOINTS.AUTH.LOGIN, {
    email,
    password,
  });

  const accessToken = response.data.data?.accessToken;

  if (accessToken) {
    setAccessToken(accessToken);
  }

  return response.data;
};

export const restoreSession = async () => {
  try {
    const response = await api.post(ENDPOINTS.AUTH.REFRESH_TOKEN);

    const accessToken = response.data.data?.accessToken;

    if (!accessToken) {
      clearToken();
      return null;
    }

    setAccessToken(accessToken);

    return response.data;
  } catch {
    clearToken();
    return null;
  }
};

export const logout = async () => {
  try {
    await api.post(ENDPOINTS.AUTH.LOGOUT);
  } finally {
    clearToken();
  }
};