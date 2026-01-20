import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('aikasir_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await getMe();
      setUser(response.data.user);
      setTenant(response.data.tenant);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('aikasir_token');
    } finally {
      setLoading(false);
    }
  };

  const loginUser = (token, userData, tenantData) => {
    localStorage.setItem('aikasir_token', token);
    localStorage.setItem('aikasir_user', JSON.stringify(userData));
    localStorage.setItem('aikasir_tenant', JSON.stringify(tenantData));
    setUser(userData);
    setTenant(tenantData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('aikasir_token');
    localStorage.removeItem('aikasir_user');
    localStorage.removeItem('aikasir_tenant');
    setUser(null);
    setTenant(null);
    setIsAuthenticated(false);
  };

  const updateTenant = (tenantData) => {
    setTenant(tenantData);
    localStorage.setItem('aikasir_tenant', JSON.stringify(tenantData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        loading,
        isAuthenticated,
        loginUser,
        logout,
        checkAuth,
        updateTenant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
