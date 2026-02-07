import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, LogIn, ChevronRight } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../app/AuthContext';
import { AuthService } from '../services/api/authService';
import { theme } from '../theme';

const LoginScreen = ({ navigation }: any) => {
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
      await signIn(data.accessToken, data.refreshToken);
      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: `Welcome back!`,
        position: 'top',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Login failed. Please check your credentials.',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logoPlaceholder}>
              <LogIn size={40} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>{t('auth.login_button')}</Text>
            <Text style={styles.subtitle}>Sign in to continue to CityMarket</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Mail size={20} color={theme.colors.textMuted} />
              </View>
              <TextInput
                style={styles.input}
                placeholder={t('auth.email')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Lock size={20} color={theme.colors.textMuted} />
              </View>
              <TextInput
                style={styles.input}
                placeholder={t('auth.password')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <>
                  <Text style={styles.buttonText}>{t('common.login')}</Text>
                  <ChevronRight size={20} color={theme.colors.white} style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('auth.dont_have_account')?.split('?')[0]}? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.white },
  container: {
    padding: 30,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...theme.shadows.soft,
  },
  title: {
    fontSize: 32,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputIcon: {
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    height: 55,
    fontSize: 16,
    color: theme.colors.primary,
  },
  button: {
    backgroundColor: theme.colors.primary,
    height: 55,
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    ...theme.shadows.medium,
  },
  disabledButton: {
    backgroundColor: theme.colors.surface,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: theme.typography.weights.bold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  linkText: {
    color: theme.colors.secondary,
    fontSize: 14,
    fontWeight: theme.typography.weights.bold,
  },
});

export default LoginScreen;
