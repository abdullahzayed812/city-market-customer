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
import { User, Mail, Lock, UserPlus, ChevronLeft } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthService } from '../services/api/authService';
import { theme } from '../theme';

const RegisterScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
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
            await AsyncStorage.setItem('auth_token', data.token);
            await AsyncStorage.setItem('refresh_token', data.refreshToken);
            Toast.show({
                type: 'success',
                text1: 'Registration Successful',
                text2: `Welcome to CityMarket, ${firstName}!`,
                position: 'top',
            });
            navigation.replace('Main');
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: t('common.error'),
                text2: 'Registration failed. Please try again.',
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
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ChevronLeft size={24} color={theme.colors.primary} />
                </TouchableOpacity>

                <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <View style={styles.logoPlaceholder}>
                            <UserPlus size={40} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.title}>{t('auth.register_button')}</Text>
                        <Text style={styles.subtitle}>Create an account to start shopping</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputRow}>
                            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('auth.first_name')}
                                    value={formData.firstName}
                                    onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                                    placeholderTextColor={theme.colors.textMuted}
                                />
                            </View>
                            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('auth.last_name')}
                                    value={formData.lastName}
                                    onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                                    placeholderTextColor={theme.colors.textMuted}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <View style={styles.inputIcon}>
                                <Mail size={20} color={theme.colors.textMuted} />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder={t('auth.email')}
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
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
                                value={formData.password}
                                onChangeText={(text) => setFormData({ ...formData, password: text })}
                                secureTextEntry
                                placeholderTextColor={theme.colors.textMuted}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.disabledButton]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={theme.colors.white} />
                            ) : (
                                <Text style={styles.buttonText}>{t('auth.register_button')}</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>{t('auth.already_have_account')?.split('?')[0]}? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.linkText}>Login</Text>
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
        paddingTop: 40,
        flexGrow: 1,
    },
    backButton: {
        padding: 20,
        position: 'absolute',
        top: 50,
        left: 10,
        zIndex: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
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
        fontSize: 28,
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
    inputRow: {
        flexDirection: 'row',
        marginBottom: 16,
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
        paddingHorizontal: 15,
    },
    button: {
        backgroundColor: theme.colors.primary,
        height: 55,
        borderRadius: theme.radius.md,
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
        marginBottom: 20,
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

export default RegisterScreen;
