import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import ApiService from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: any;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authVersion, setAuthVersion] = useState(0); // Force re-renders

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('user');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await ApiService.login(email, password);
      
      if (response.success) {
        const { user: userData, token } = response.data;
        
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        setAuthVersion(prev => prev + 1);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'An error occurred during login'
      );
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await ApiService.register(name, email, password);
      
      if (response.success) {
        const { user: userData, token } = response.data;
        
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        setAuthVersion(prev => prev + 1);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'An error occurred during registration'
      );
    }
  };

  const logout = async () => {
    try {
      console.log('🔄 Starting logout process...');
      setIsLoading(true);
      
      // Clear all authentication data
      console.log('🗑️ Clearing AsyncStorage...');
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      console.log('✅ AsyncStorage cleared successfully');
      
      // Reset user state
      console.log('👤 Resetting user state...');
      setUser(null);
      console.log('✅ User state reset to null');
      
      // Force re-render
      setAuthVersion(prev => prev + 1);
      console.log('🔄 Auth version incremented to force re-render');
      
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if there's an error clearing storage, we should still reset the user state
      console.log('🔄 Force resetting user state due to error...');
      setUser(null);
      setAuthVersion(prev => prev + 1);
    } finally {
      setIsLoading(false);
      console.log('✅ Logout process completed, isLoading set to false');
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  console.log('🔐 AuthContext value update - user:', user ? 'present' : 'null', 'isAuthenticated:', !!user, 'isLoading:', isLoading);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 