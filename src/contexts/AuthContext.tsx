import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, UserForm, AuthResponse } from '../api/client';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (data: UserForm) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const signUp = async (data: UserForm) => {
    try {
      console.log('Attempting to sign up with:', data);
      // According to the API schema, we need to send the user object
      const response = await apiClient.post('/users', data);
      console.log('Sign up successful:', response.data);
      // Note: User needs to activate their account via email
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/tokens/authentication', {
        email,
        password,
      });
      
      console.log('Auth response:', response.data);
      // Handle the incorrect key "authentication_token:" with a colon
      const token = response.data.authentication_token || response.data["authentication_token:"];
      
      if (!token) {
        console.error('No token in response:', response.data);
        throw new Error('Authentication failed - no token received');
      }
      
      localStorage.setItem('authToken', token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, signUp, signIn, signOut }}>
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