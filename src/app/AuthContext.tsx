import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setSignOutCallback } from '../services/api/apiClient';

interface User {
  userId: string;
  email: string;
  role: string;
  name?: string;
}

interface AuthContextType {
  userToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (user: any, token: string, refreshToken: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSignOutCallback(() => {
      setUserToken(null);
      setUser(null);
    });
  }, []);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        const userData = await AsyncStorage.getItem('user');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUserToken(token);
          setUser(parsedUser);
        }
      } catch (e) {
        console.error('Failed to load auth data', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = useMemo(() => ({
    userToken,
    user,
    isAuthenticated: !!userToken,
    isLoading,
    signIn: async (userData: any, token: string, refreshToken: string) => {
      if (userData && token) {
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        await AsyncStorage.setItem('auth_token', token);
        await AsyncStorage.setItem('refresh_token', refreshToken);

        setUserToken(token);
        setUser(userData);
      } else {
        throw new Error('Invalid token received');
      }
    },
    signOut: async () => {
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user']);
      setUserToken(null);
      setUser(null);
    },
  }), [userToken, user, isLoading]);

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
