import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, UserForm, AuthResponse, User, UserProfileResponse } from '../api/client';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  userLoading: boolean;
  signUp: (data: UserForm) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  getProfile: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
    setIsLoading(false);
    
    // If we have a token and are authenticated, try to load the user profile
    if (token) {
      getProfile().catch(err => {
        console.error("Error auto-loading profile:", err);
      });
    }
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
      
      // Load the user profile immediately after login
      try {
        await getProfile();
      } catch (profileError) {
        console.error('Error fetching profile after login:', profileError);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
  };
  
  const getProfile = async (): Promise<User> => {
    try {
      setUserLoading(true);
      const response = await apiClient.get<UserProfileResponse>('/users/profile');
      console.log('Profile data:', response.data);
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    } finally {
      setUserLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      user, 
      userLoading, 
      signUp, 
      signIn, 
      signOut, 
      getProfile 
    }}>
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