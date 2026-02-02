import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, I18nManager, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
// Wait, I should check package.json for react-native-restart.
// If not available, I might need to just reload or ask user to restart.
// Let's check package.json first. But for now I'll write the code assuming I can use I18nManager.forceRTL and reload.

const LanguageSettingsScreen = () => {
    const { t, i18n } = useTranslation();

    const changeLanguage = async (lang: string) => {
        const isRTL = lang === 'ar';
        if (isRTL !== I18nManager.isRTL) {
            I18nManager.allowRTL(isRTL);
            I18nManager.forceRTL(isRTL);
            i18n.changeLanguage(lang);
            Alert.alert(
                t('common.language_changed'),
                t('common.restart_app'),
                [{ text: 'OK' }] // In a real app with react-native-restart, we would restart here.
            );
        } else {
            i18n.changeLanguage(lang);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('profile.language')}</Text>
            </View>

            <View style={styles.content}>
                <TouchableOpacity
                    style={[styles.option, i18n.language === 'en' && styles.selectedOption]}
                    onPress={() => changeLanguage('en')}
                >
                    <Text style={[styles.optionText, i18n.language === 'en' && styles.selectedText]}>English</Text>
                    {i18n.language === 'en' && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.option, i18n.language === 'ar' && styles.selectedOption]}
                    onPress={() => changeLanguage('ar')}
                >
                    <Text style={[styles.optionText, i18n.language === 'ar' && styles.selectedText]}>العربية</Text>
                    {i18n.language === 'ar' && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
    title: { fontSize: 24, fontWeight: 'bold' },
    content: { marginTop: 20, backgroundColor: '#fff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E5E5EA' },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA'
    },
    selectedOption: { backgroundColor: '#F0F7FF' },
    optionText: { fontSize: 16 },
    selectedText: { color: '#007AFF', fontWeight: 'bold' },
    check: { color: '#007AFF', fontSize: 18, fontWeight: 'bold' },
});

export default LanguageSettingsScreen;
