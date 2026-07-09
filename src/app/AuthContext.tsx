import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { setSignOutCallback } from '../services/api/apiClient';
import { AuthService } from '../services/api/authService';
import { UserService } from '../services/api/userService';
import { SecureStorage } from '../services/secureStorage';
import { getDeviceId } from '../utils/deviceId';

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
  signOutAllDevices: () => Promise<void>;
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
        const token = await SecureStorage.getAccessToken();
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

  const clearLocalState = async () => {
    await SecureStorage.clearAll();
    await AsyncStorage.removeItem('user');
    setUserToken(null);
    setUser(null);
  };

  const authContext = useMemo(() => ({
    userToken,
    user,
    isAuthenticated: !!userToken,
    isLoading,
    signIn: async (userData: any, token: string, refreshToken: string) => {
      if (userData && token) {
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        await SecureStorage.setAccessToken(token);
        await SecureStorage.setRefreshToken(refreshToken);

        setUserToken(token);
        setUser(userData);

        // Register device info in background (fire and forget)
        getDeviceId().then(deviceId => {
          UserService.registerDevice({
            deviceId,
            platform: Platform.OS as 'ios' | 'android',
          }).catch(() => {});
        }).catch(() => {});
      } else {
        throw new Error('Invalid token received');
      }
    },
    signOut: async () => {
      try {
        await AuthService.logout();
      } catch {
        // ignore — we still clear local state
      }
      await clearLocalState();
    },
    signOutAllDevices: async () => {
      try {
        await AuthService.logoutAll();
      } catch {
        // ignore — we still clear local state
      }
      await clearLocalState();
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
