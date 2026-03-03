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
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { User, Mail, Lock, UserPlus, ChevronLeft, ArrowRight } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../app/AuthContext'; // Corrected import to use AuthContext hook if available or service directly
import { AuthService } from '../services/api/authService';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

const RegisterScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { signIn } = useAuth(); // Assuming useAuth exposes a way to sign in after registration
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
      // Assuming register returns user and tokens, similar to login
      const data = await AuthService.register(formData); 
      
      // Auto-login after registration if supported, or navigate to login
      if (data?.token && data?.user) {
          await signIn(data.user, data.token, data.refreshToken);
          Toast.show({
            type: 'success',
            text1: 'Registration Successful',
            text2: `Welcome, ${firstName}!`,
            position: 'bottom',
          });
          // Navigation is handled by AuthContext state change usually
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
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <ChevronLeft size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.iconCircle}>
                    <UserPlus size={32} color={theme.colors.primary} />
                </View>
                <Text style={styles.title}>{t('auth.register_title') || 'Create Account'}</Text>
                <Text style={styles.subtitle}>
                    {t('auth.register_subtitle') || 'Sign up to start your journey with us.'}
                </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formContainer}>
                <View style={styles.row}>
                    <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                        <Text style={styles.inputLabel}>{t('auth.first_name') || 'First Name'}</Text>
                        <View style={styles.inputField}>
                            <TextInput
                                style={styles.input}
                                placeholder="John"
                                value={formData.firstName}
                                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                                placeholderTextColor={theme.colors.textMuted}
                            />
                        </View>
                    </View>
                    <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8 }]}>
                        <Text style={styles.inputLabel}>{t('auth.last_name') || 'Last Name'}</Text>
                        <View style={styles.inputField}>
                            <TextInput
                                style={styles.input}
                                placeholder="Doe"
                                value={formData.lastName}
                                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                                placeholderTextColor={theme.colors.textMuted}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>{t('auth.email') || 'Email Address'}</Text>
                    <View style={styles.inputField}>
                        <Mail size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="name@example.com"
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
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
                            value={formData.password}
                            onChangeText={(text) => setFormData({ ...formData, password: text })}
                            secureTextEntry
                            placeholderTextColor={theme.colors.textMuted}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.registerButton, loading && styles.disabledButton]}
                    onPress={handleRegister}
                    disabled={loading}
                    activeOpacity={0.9}
                >
                    {loading ? (
                        <ActivityIndicator color={theme.colors.white} />
                    ) : (
                        <>
                            <Text style={styles.registerButtonText}>{t('auth.register_button') || 'Sign Up'}</Text>
                            <ArrowRight size={20} color={theme.colors.white} strokeWidth={2.5} />
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Footer Section */}
            <View style={styles.footerContainer}>
                <Text style={styles.footerText}>
                    {t('auth.already_have_account') || "Already have an account?"}{' '}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginText}>{t('auth.login_button') || 'Sign In'}</Text>
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
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.md,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
    marginLeft: -8, // alignment adjustment
    zIndex: 10,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.xl, // Space for back button
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.textPrimary,
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
  formContainer: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  row: {
      flexDirection: 'row',
      marginBottom: theme.spacing.lg,
  },
  inputWrapper: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
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
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  registerButton: {
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
  registerButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.white,
    marginRight: 12,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingVertical: theme.spacing.lg,
  },
  footerText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  loginText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
  },
});

export default RegisterScreen;
