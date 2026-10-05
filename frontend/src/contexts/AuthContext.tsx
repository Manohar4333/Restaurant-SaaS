import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { User, Tenant, Subscription } from '../types';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  subscription: Subscription | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data.user);
      setTenant(res.data.data.tenant);
      setSubscription(res.data.data.subscription);
    } catch (err) {
      setUser(null);
      setTenant(null);
      setSubscription(null);
      setToken(null);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshProfile();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { accessToken, user: userData, tenant: tenantData, subscription: subData } = res.data.data;
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
    setUser(userData);
    setTenant(tenantData);
    setSubscription(subData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore logout errors
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setTenant(null);
      setSubscription(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        subscription,
        token,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
