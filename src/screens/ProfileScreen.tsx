import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  I18nManager,
  Alert,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../app/AuthContext';
import { UserService } from '../services/api/userService';
import { AuthService } from '../services/api/authService';

const ProfileScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const { signOut } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: UserService.getProfile,
  });

  console.log(profile);

  const handleLogout = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }
      await signOut();
    } catch (error) {
      Alert.alert(t('common.error'), 'Logout failed');
    }
  };

  //   const toggleLanguage = async () => {
  //     const newLang = i18n.language === 'ar' ? 'en' : 'ar';
  //     const isRTL = newLang === 'ar';

  //     if (I18nManager.isRTL !== isRTL) {
  //       I18nManager.forceRTL(isRTL);
  //     }

  //     await i18n.changeLanguage(newLang);
  //     Alert.alert(
  //       'Language Changed',
  //       'Please restart the app to apply RTL/LTR changes fully.',
  //     );
  //   };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile?.firstName?.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>
          {profile?.firstName} {profile?.lastName}
        </Text>
        <Text style={styles.email}>{profile?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.info')}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('auth.full_name')}</Text>
          <Text style={styles.infoValue}>{profile?.fullName || 'Not set'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('auth.phone')}</Text>
          <Text style={styles.infoValue}>{profile?.phone || 'Not set'}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('Addresses')}
      >
        <Text style={styles.menuItemText}>{t('profile.addresses')}</Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('LanguageSettings')}
      >
        <Text style={styles.menuItemText}>{t('profile.language')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.langValue, { marginRight: 10 }]}>
            {i18n.language === 'ar' ? 'العربية' : 'English'}
          </Text>
          <Text style={styles.arrow}>›</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.menuItem, styles.logoutItem]}
        onPress={handleLogout}
      >
        <Text style={[styles.menuItemText, styles.logoutText]}>
          {t('common.logout')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileHeader: {
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  email: { fontSize: 14, color: '#8E8E93', marginTop: 5 },
  section: { backgroundColor: '#fff', marginTop: 20, padding: 15 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8E8E93',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  infoLabel: { fontSize: 16, color: '#3C3C43' },
  infoValue: { fontSize: 16, fontWeight: '600' },
  menuItem: {
    backgroundColor: '#fff',
    marginTop: 20,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemText: { fontSize: 16, color: '#000' },
  langValue: { color: '#007AFF', fontWeight: '600' },
  arrow: { fontSize: 24, color: '#C7C7CC' },
  logoutItem: { marginTop: 40, justifyContent: 'center' },
  logoutText: { color: '#FF3B30', fontWeight: 'bold' },
});

export default ProfileScreen;
