import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { useAuth } from '../app/AuthContext';
import { AuthService } from '../services/api/authService';

export const useLogin = (navigation: any) => {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('customer@citymarket.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Please fill all fields',
        position: 'top',
      });
      return;
    }

    setLoading(true);
    try {
      const data = await AuthService.login({ email, password });
      await signIn(data?.user, data.accessToken, data.refreshToken);
      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
        text2: `Signed in as ${data?.user?.name || 'Customer'}`,
        position: 'bottom',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Invalid credentials',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Toast.show({ type: 'info', text1: 'Feature coming soon' });
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return {
    t,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleLogin,
    handleForgotPassword,
    navigateToRegister,
  };
};
