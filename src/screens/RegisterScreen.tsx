import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/api/authService';

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
            Alert.alert(t('common.error'), 'Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            const data = await AuthService.register(formData);
            await AsyncStorage.setItem('auth_token', data.token);
            await AsyncStorage.setItem('refresh_token', data.refreshToken);
            navigation.replace('Main');
        } catch (error) {
            Alert.alert(t('common.error'), 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{t('auth.register_button')}</Text>

            <TextInput
                style={styles.input}
                placeholder={t('auth.first_name')}
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
            />

            <TextInput
                style={styles.input}
                placeholder={t('auth.last_name')}
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
            />

            <TextInput
                style={styles.input}
                placeholder={t('auth.email')}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder={t('auth.password')}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>{t('common.register')}</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.linkButton}
                onPress={() => navigation.navigate('Login')}
            >
                <Text style={styles.linkText}>{t('auth.already_have_account')}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff'
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
        color: '#333'
    },
    input: {
        height: 55,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#007AFF',
        height: 55,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    linkText: {
        color: '#007AFF',
        fontSize: 16,
    },
});

export default RegisterScreen;
