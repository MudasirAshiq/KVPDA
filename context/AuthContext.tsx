import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  needsPasswordChange: boolean;
  dealerLogin: (email: string, password: string) => Promise<void>;
  adminLogin: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateUser: (updatedData: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for a saved user session in localStorage on initial load.
    const savedUserJson = localStorage.getItem('user');
    if (savedUserJson) {
      try {
        const savedUser: User = JSON.parse(savedUserJson);
        setUser(savedUser);
      } catch (error) {
        console.error("Failed to parse saved user from localStorage", error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);
  
  const handleLoginSuccess = (loggedInUser: User) => {
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const dealerLogin = async (email: string, password: string) => {
    const loggedInUser = await api.dealerLogin(email, password);
    handleLoginSuccess(loggedInUser);
  };

  const adminLogin = async (password: string) => {
    const loggedInUser = await api.adminLogin(password);
    handleLoginSuccess(loggedInUser);
  };

  const logout = async () => {
    await api.logout();
    localStorage.removeItem('user');
    setUser(null);
  };

  const updatePassword = async (newPassword: string) => {
    if (!user) throw new Error("No user is logged in.");
    const updatedUser = await api.changePassword(user.id, newPassword);
    handleLoginSuccess(updatedUser);
  };

  const updateUser = (updatedData: Partial<User>) => {
      if (user) {
          const updatedUser = { ...user, ...updatedData };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
      }
  };
  
  const value = {
    user,
    loading,
    needsPasswordChange: user?.tempPass || false,
    dealerLogin,
    adminLogin,
    logout,
    updatePassword,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};