import axios from "axios";
import api from "./axiosClient";
import { API_BASE_URL, ENDPOINTS } from "./apiEndpoints";
import {
  getAccessToken,
  setAccessToken,
  clearToken,
} from "../utils/token";

let refreshPromise = null;


// Add access token to API requests
api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


// Handle expired access token
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const isAuthRequest =
      originalRequest.url?.includes(ENDPOINTS.AUTH.LOGIN) ||
      originalRequest.url?.includes(ENDPOINTS.AUTH.REFRESH_TOKEN) ||
      originalRequest.url?.includes(ENDPOINTS.AUTH.LOGOUT);

    if (isAuthRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true; // for avoid infinite loop in case of refresh token failure

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(
            `${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH_TOKEN}`, // browser refresh token request
            {},
            { withCredentials: true }
          )
          .then((response) => {
            const newAccessToken = response.data?.data?.accessToken;

            if (!newAccessToken) {
              throw new Error("Unable to refresh access token");
            }

            setAccessToken(newAccessToken);

            return newAccessToken;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);

    } catch (refreshError) {
      clearToken();

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    }
  }
);