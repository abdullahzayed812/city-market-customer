import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { useAuth } from '../app/AuthContext';
import { AuthService } from '../services/api/authService';
import { UserService } from '../services/api/userService';
import { SecureStorage } from '../services/secureStorage';

interface PendingAuth {
  user: any;
  accessToken: string;
  refreshToken: string;
}

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

  // Registration is two calls: create the auth account, then create the customer
  // profile (name/phone). Both need to succeed for the account to be usable, but
  // they can't be one atomic transaction across two services. Two things guard
  // against that gap:
  //
  // 1. Pre-check the phone against user-service *before* creating the auth account
  //    at all — the common case (phone already taken) never creates an account in
  //    the first place, so there's nothing to leave orphaned.
  // 2. For the residual race (two signups with the same phone landing at the same
  //    instant), we authorize the createCustomer call directly via SecureStorage
  //    instead of calling the full AuthContext signIn() — which flips
  //    isAuthenticated and makes RootNavigator swap the whole stack from the auth
  //    screens to the main app, tearing this screen down regardless of local
  //    component state. Holding off on that flip keeps the user here, in "finish
  //    setting up" mode, until both steps have actually succeeded.
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [pendingAuth, setPendingAuth] = useState<PendingAuth | null>(null);

  const saveProfile = async (auth: PendingAuth) => {
    const { firstName, lastName, phone } = formData;
    try {
      await UserService.createCustomer({
        fullName: `${firstName} ${lastName}`,
        phone,
      });
      await signIn(auth.user, auth.accessToken, auth.refreshToken);
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
    } catch (error: any) {
      const code = error?.response?.data?.message;
      if (code === 'phone_already_registered') {
        setPhoneError(t('auth.validation_phone_already_registered') || 'This phone number is already registered to another account');
      } else {
        Toast.show({
          type: 'error',
          text1: t('common.error'),
          text2: code || t('auth.profile_setup_failed') || "We couldn't finish setting up your profile.",
          position: 'bottom',
        });
      }
      setNeedsProfileCompletion(true);
    }
  };

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
      if (needsProfileCompletion && pendingAuth) {
        setPhoneError(null);
        await saveProfile(pendingAuth);
        return;
      }

      const phoneAvailable = await UserService.checkPhoneAvailable(phone);
      if (!phoneAvailable) {
        setPhoneError(t('auth.validation_phone_already_registered') || 'This phone number is already registered to another account');
        return;
      }

      const data = await AuthService.register({ email, password, role: 'customer' });

      if (data?.accessToken && data?.user) {
        // Authorize this client for the createCustomer call without marking the app
        // "logged in" yet — see comment above.
        await SecureStorage.setAccessToken(data.accessToken);
        const auth: PendingAuth = { user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken };
        setPendingAuth(auth);
        await saveProfile(auth);
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
    needsProfileCompletion,
    phoneError,
  };
};
