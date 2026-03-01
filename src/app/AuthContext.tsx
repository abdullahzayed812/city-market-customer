import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        const userData = await AsyncStorage.getItem('user');
        const parsedUser = JSON.parse(userData || '');

        if (token) {
          if (parsedUser) {
            setUserToken(token);
            setUser(parsedUser);
          } else {
            // Token invalid or corrupt
            await AsyncStorage.removeItem('auth_token');
          }
        }
      } catch (e) {
        console.error('Failed to load auth data', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, [user]);

  const authContext = {
    userToken,
    user,
    isAuthenticated: !!userToken,
    isLoading,
    signIn: async (user: any, token: string, refreshToken: string) => {
      if (user && token) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('auth_token', token);
        await AsyncStorage.setItem('refresh_token', refreshToken);

        setUserToken(token);
        setUser(user);
      } else {
        throw new Error('Invalid token received');
      }
    },
    signOut: async () => {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('refresh_token');
      setUserToken(null);
      setUser(null);
    },
  };

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
