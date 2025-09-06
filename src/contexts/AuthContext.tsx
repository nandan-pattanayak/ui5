import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  username: string;
  email: string;
  credits: number;
  user_id: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email: string) => Promise<{ credits: number }>;
  logout: () => Promise<void>;
  verifyAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = 'https://my-fastapi-service-608954479960.us-central1.run.app';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSessionData = () => {
    // Clear all localStorage data to prevent data leakage between users
    localStorage.removeItem('generatedLeads');
    localStorage.removeItem('enrichedLeads');
    localStorage.removeItem('queryId');
    // Clear any other session-specific data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('lead') || key.includes('query') || key.includes('session'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  };

  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Request failed');
    }

    return response.json();
  };

  const login = async (username: string, password: string) => {
    // Clear any existing session data before login
    clearSessionData();
    
    const data = await apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    await verifyAuth();
    return data;
  };

  const register = async (username: string, password: string, email: string) => {
    // Clear any existing session data before registration
    clearSessionData();
    
    const data = await apiRequest('/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, email }),
    });
    return data;
  };

  const logout = async () => {
    await apiRequest('/logout', { method: 'POST' });
    // Clear all session data on logout
    clearSessionData();
    setUser(null);
  };

  const verifyAuth = async () => {
    try {
      const userData = await apiRequest('/auth/verify');
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    verifyAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, verifyAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};