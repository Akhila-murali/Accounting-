import { createContext, useContext, useEffect, useState } from "react";

import {
  login as loginRequest,
  logout as logoutRequest,
  restoreSession,
} from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await restoreSession();

        if (response?.success && response.data?.accessToken) {
          setIsAuthenticated(true);
          setUser(response.data?.user || null);
        }
      } catch {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email, password) => {
    const response = await loginRequest(email, password);

    if (response?.success) {
      setIsAuthenticated(true);
      setUser(response.data?.user || null);
    }

    return response;
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAuthLoading,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}