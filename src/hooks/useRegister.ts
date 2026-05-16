import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { useAuth } from '../app/AuthContext';
import { AuthService } from '../services/api/authService';
import { UserService } from '../services/api/userService';

export const useRegister = (navigation: any) => {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const { email, password, firstName, lastName, phone } = formData;
    if (!email || !password || !firstName || !lastName || !phone) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('auth.fill_all_fields') || 'Please fill all fields',
        position: 'top',
      });
      return;
    }

    setLoading(true);
    try {
      const data = await AuthService.register({ email, password, role: 'customer' });

      if (data?.accessToken && data?.user) {
        await signIn(data.user, data.accessToken, data.refreshToken);
        await UserService.createCustomer({
          fullName: `${firstName} ${lastName}`,
          phone,
        });
        Toast.show({
          type: 'success',
          text1: t('auth.register_success') || 'Registration Successful',
          text2: `${t('auth.welcome') || 'Welcome'}, ${firstName}!`,
          position: 'bottom',
        });
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('Main');
        }
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2:
          error?.response?.data?.message ||
          t('auth.register_failed') ||
          'Registration failed. Please try again.',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return {
    t,
    formData,
    updateFormData,
    loading,
    handleRegister,
    navigateToLogin,
  };
};
