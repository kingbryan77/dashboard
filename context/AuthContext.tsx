import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { User, AuthStatus, UserProfileUpdate } from '../types';
import * as authService from '../services/authService';

interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  login: (identifier: string, passwordAttempt: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'username' | 'isAdmin' | 'isVerified' | 'balance' | 'notifications' | 'profilePictureUrl'> & { password: string }) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  verifyEmail: (email: string) => Promise<boolean>;
  refreshUser: () => void;
  updateProfile: (updatedData: UserProfileUpdate) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default mock user to ensure dashboard is always functional
const DEFAULT_USER: User = {
  id: 'pro-trader-001',
  fullName: 'VIP PRO TRADER',
  username: 'protrader',
  email: 'trader@foreximf.pro',
  phoneNumber: '081234567890',
  isAdmin: true,
  isVerified: true,
  balance: 130000000,
  notifications: [],
  profilePictureUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'
};

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [user, setUser] = useState<User | null>(DEFAULT_USER);
  const [status, setStatus] = useState<AuthStatus>(AuthStatus.AUTHENTICATED);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    const currentUser = await authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      setUser(DEFAULT_USER);
    }
    setStatus(AuthStatus.AUTHENTICATED);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (identifier: string, passwordAttempt: string): Promise<boolean> => {
    return true; // Bypass for direct access
  };

  const register = async (userData: any): Promise<boolean> => {
    return true; // Bypass for direct access
  };

  const logout = async () => {
    // Disabled to keep user in dashboard
  };

  const verifyEmail = async (email: string): Promise<boolean> => {
    return true;
  };

  const updateProfile = async (updatedData: UserProfileUpdate): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    if (!user) return false;
    try {
      setUser(prev => prev ? ({ ...prev, ...updatedData }) : null);
      setIsLoading(false);
      return true;
    } catch (e: any) {
      setError(e.message || "Failed to update profile.");
      setIsLoading(false);
      return false;
    }
  };

  const value = {
    user,
    status,
    login,
    register,
    logout,
    isLoading,
    error,
    verifyEmail,
    refreshUser,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};