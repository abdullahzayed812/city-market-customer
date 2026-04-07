import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { useAuth } from '../app/AuthContext';
import { AuthService } from '../services/api/authService';

export const useRegister = (navigation: any) => {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const { email, password, firstName, lastName } = formData;
    if (!email || !password || !firstName || !lastName) {
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
      const data = await AuthService.register(formData); 
      
      if (data?.token && data?.user) {
          await signIn(data.user, data.token, data.refreshToken);
          Toast.show({
            type: 'success',
            text1: 'Registration Successful',
            text2: `Welcome, ${firstName}!`,
            position: 'bottom',
          });
      } else {
          Toast.show({
            type: 'success',
            text1: 'Registration Successful',
            text2: 'Please log in.',
            position: 'bottom',
          });
          navigation.navigate('Login');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Registration failed. Please try again.',
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
