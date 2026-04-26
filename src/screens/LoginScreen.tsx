import React, { useState, useEffect } from 'react';
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
import { Mail, Lock, ArrowRight, User, Server } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { useLogin } from '../hooks/useLogin';
import { SERVERS, getServerIP, setServerIP } from '../utils/serverConfig';

const LoginScreen = ({ navigation }: any) => {
  const [selectedServer, setSelectedServer] = useState(SERVERS.PC);
  const [customIP, setCustomIP] = useState(SERVERS.PC);

  useEffect(() => {
    const loadServer = async () => {
      const ip = await getServerIP();
      setSelectedServer(ip);
      setCustomIP(ip);
    };
    loadServer();
  }, []);

  const handleServerChange = async (ip: string) => {
    await setServerIP(ip);
    setSelectedServer(ip);
    setCustomIP(ip);
  };

  const handleApplyCustomIP = () => {
    const trimmed = customIP.trim();
    if (trimmed) handleServerChange(trimmed);
  };

  const {
    t,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleLogin,
    handleForgotPassword,
    navigateToRegister,
  } = useLogin(navigation);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={styles.iconCircle}>
              <User size={32} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>{t('auth.login_title') || 'Welcome Back'}</Text>
            <Text style={styles.subtitle}>
              {t('auth.login_subtitle') || 'Sign in to access your account and orders.'}
            </Text>
          </View>

          {/* Server Selection Section */}
          <View style={styles.serverSelectionContainer}>
            <View style={styles.serverLabelContainer}>
              <Server size={16} color={theme.colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.serverLabel}>{t('auth.server_select') || 'Select Server Environment'}</Text>
            </View>
            <View style={styles.serverButtons}>
              <TouchableOpacity
                style={[
                  styles.serverButton,
                  selectedServer === SERVERS.PC && styles.activeServerButton,
                ]}
                onPress={() => handleServerChange(SERVERS.PC)}
              >
                <Text
                  style={[
                    styles.serverButtonText,
                    selectedServer === SERVERS.PC && styles.activeServerButtonText,
                  ]}
                >
                  {t('auth.server_pc') || 'PC (128)'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.serverButton,
                  selectedServer === SERVERS.LAPTOP && styles.activeServerButton,
                ]}
                onPress={() => handleServerChange(SERVERS.LAPTOP)}
              >
                <Text
                  style={[
                    styles.serverButtonText,
                    selectedServer === SERVERS.LAPTOP && styles.activeServerButtonText,
                  ]}
                >
                  {t('auth.server_laptop') || 'Laptop (2)'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.customIPRow}>
              <TextInput
                style={styles.customIPInput}
                value={customIP}
                onChangeText={setCustomIP}
                placeholder="192.168.0.x"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="decimal-pad"
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={handleApplyCustomIP}
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.customIPApply} onPress={handleApplyCustomIP}>
                <Text style={styles.customIPApplyText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>{t('auth.email') || 'Email Address'}</Text>
              <View style={styles.inputField}>
                <Mail size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={theme.colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>{t('auth.password') || 'Password'}</Text>
              <View style={styles.inputField}>
                <Lock size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor={theme.colors.textMuted}
                />
              </View>
              <TouchableOpacity 
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>
                  {t('auth.forgot_password') || 'Forgot Password?'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>{t('auth.login_button') || 'Sign In'}</Text>
                  <ArrowRight size={20} color={theme.colors.white} strokeWidth={2.5} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Section */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              {t('auth.no_account') || "Don't have an account?"}{' '}
            </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={styles.registerText}>{t('auth.register') || 'Sign Up'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.lg,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '80%',
  },
  serverSelectionContainer: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  serverLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serverLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  serverButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  serverButton: {
    flex: 1,
    height: 44,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeServerButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  serverButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeServerButtonText: {
    color: theme.colors.white,
  },
  customIPRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  customIPInput: {
    flex: 1,
    height: 40,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  customIPApply: {
    height: 40,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customIPApplyText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.white,
  },
  formContainer: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  inputWrapper: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    height: 56,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.soft,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    height: 58,
    borderRadius: theme.radius.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    ...theme.shadows.medium,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.white,
    marginRight: 12,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  footerText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  registerText: {
    fontSize: 15,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
