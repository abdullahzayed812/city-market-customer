import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { useAuth } from '../app/AuthContext';
import { AuthService } from '../services/api/authService';
import { DEMO_MODE, DEMO_ACCOUNTS, DEMO_PASSWORD } from '../config/demo';

export const useLogin = (navigation: any) => {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  // Demo account prefilled while DEMO_MODE is on (see src/config/demo.ts)
  const [email, setEmail] = useState(DEMO_MODE ? DEMO_ACCOUNTS[0].email : '');
  const [password, setPassword] = useState(DEMO_MODE ? DEMO_PASSWORD : '');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => loginWith(email, password);

  const loginWith = async (email: string, password: string) => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('auth.fill_all_fields'),
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
        text1: t('auth.login_success_title'),
        text2: t('auth.login_success_message', {
          name: data?.user?.name || t('common.customer'),
        }),
        position: 'bottom',
      });
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Main');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('auth.invalid_credentials'),
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Toast.show({ type: 'info', text1: t('common.feature_coming_soon') });
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
    loginWith,
    handleForgotPassword,
    navigateToRegister,
  };
};
