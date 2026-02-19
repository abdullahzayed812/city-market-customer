import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, I18nManager, StatusBar } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { theme } from '../theme';

const LanguageSettingsScreen = ({ navigation }: any) => {
    const { t, i18n } = useTranslation();

    const changeLanguage = async (lang: string) => {
        const isRTL = lang === 'ar';
        if (isRTL !== I18nManager.isRTL) {
            I18nManager.allowRTL(isRTL);
            I18nManager.forceRTL(isRTL);
            i18n.changeLanguage(lang);
            Toast.show({
                type: 'info',
                text1: t('common.language_changed'),
                text2: t('common.restart_app'),
                position: 'top',
                autoHide: false,
            });
        } else {
            i18n.changeLanguage(lang);
        }
    };

    const LanguageOption = ({ label, langCode }: { label: string; langCode: string }) => {
        const isSelected = i18n.language === langCode;
        return (
            <TouchableOpacity
                style={[styles.option, isSelected && styles.selectedOption]}
                onPress={() => changeLanguage(langCode)}
                activeOpacity={0.7}
            >
                <View style={styles.optionContent}>
                    <View style={[styles.flagIcon, { backgroundColor: isSelected ? theme.colors.primary + '15' : theme.colors.background }]}>
                        <Globe size={22} color={isSelected ? theme.colors.primary : theme.colors.textMuted} />
                    </View>
                    <Text style={[styles.optionText, isSelected && styles.selectedText]}>{label}</Text>
                </View>
                {isSelected && (
                    <View style={styles.checkBadge}>
                        <Check size={16} color={theme.colors.white} />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>{t('profile.language')}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>{t('common.select_language')}</Text>
                    <LanguageOption label="English" langCode="en" />
                    <LanguageOption label="العربية" langCode="ar" />
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        {t('common.language_note')}
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.white },
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
        padding: theme.spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.white,
        ...theme.shadows.soft,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: theme.typography.sizes.xl,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.primary,
    },
    content: {
        padding: theme.spacing.lg,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: theme.colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 20,
        paddingLeft: 4,
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.white,
        borderRadius: theme.radius.lg,
        marginBottom: theme.spacing.md,
        ...theme.shadows.soft,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    selectedOption: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.white,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    flagIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionText: {
        fontSize: 16,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.primary,
    },
    selectedText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    checkBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoBox: {
        margin: theme.spacing.lg,
        padding: 20,
        backgroundColor: '#FFF9C4', // Very light warning yellow
        borderRadius: theme.radius.md,
        borderLeftWidth: 4,
        borderLeftColor: '#FBC02D',
    },
    infoText: {
        fontSize: 13,
        lineHeight: 20,
        color: '#5D4037',
        fontStyle: 'italic',
    },
});

export default LanguageSettingsScreen;
