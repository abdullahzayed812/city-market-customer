import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { User, MapPin, Globe, LogOut, ChevronRight, Mail, Phone, Settings } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../app/AuthContext';
import { UserService } from '../services/api/userService';
import { AuthService } from '../services/api/authService';
import { theme } from '../theme';

const ProfileScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const { signOut } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: UserService.getProfile,
  });

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

  const ProfileMenuItem = ({ icon: Icon, label, value, onPress, isLast = false, color = theme.colors.primary }: any) => (
    <TouchableOpacity
      style={[styles.menuItem, isLast && { borderBottomWidth: 0 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconContainer, { backgroundColor: color + '10' }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuLabel}>{label}</Text>
        {value && <Text style={styles.menuValueText}>{value}</Text>}
      </View>
      <ChevronRight size={20} color={theme.colors.border} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{profile?.firstName?.charAt(0)}</Text>
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Settings size={16} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>
            {profile?.firstName} {profile?.lastName}
          </Text>
          <View style={styles.emailContainer}>
            <Mail size={14} color={theme.colors.textMuted} />
            <Text style={styles.email}>{profile?.email}</Text>
          </View>
        </View>

        {/* Quick Info Group */}
        <View style={styles.infoGroup}>
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>{t('auth.full_name')}</Text>
              <Text style={styles.infoValue}>{profile?.fullName || 'Not set'}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>{t('auth.phone')}</Text>
              <Text style={styles.infoValue}>{profile?.phone || 'Not set'}</Text>
            </View>
          </View>
        </View>

        {/* Settings Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.menuCard}>
            <ProfileMenuItem
              icon={MapPin}
              label={t('profile.addresses')}
              onPress={() => navigation.navigate('Addresses')}
            />
            <ProfileMenuItem
              icon={Globe}
              label={t('profile.language')}
              value={i18n.language === 'ar' ? 'العربية' : 'English'}
              onPress={() => navigation.navigate('LanguageSettings')}
              isLast={true}
            />
          </View>
        </View>

        {/* Support Section (Mock) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuCard}>
            <ProfileMenuItem
              icon={Settings}
              label="Help Center"
              onPress={() => { }}
            />
            <ProfileMenuItem
              icon={User}
              label="Account Privacy"
              onPress={() => { }}
              isLast={true}
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <View style={[styles.menuIconContainer, { backgroundColor: theme.colors.error + '10' }]}>
            <LogOut size={20} color={theme.colors.error} />
          </View>
          <Text style={styles.logoutText}>{t('common.logout')}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.white },
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
  profileHeader: {
    backgroundColor: theme.colors.white,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
    ...theme.shadows.soft,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.secondary,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: theme.colors.white, fontSize: 40, fontWeight: 'bold' },
  name: { fontSize: 24, fontWeight: 'bold', color: theme.colors.primary },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  email: { fontSize: 14, color: theme.colors.textMuted, marginLeft: 6 },
  infoGroup: {
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.lg,
    marginTop: -20,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoCol: {
    flex: 1,
    alignItems: 'center',
  },
  infoDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.border,
  },
  infoLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    ...theme.shadows.soft,
  },
  menuItem: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
  },
  menuValueText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.lg,
    marginTop: 40,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    ...theme.shadows.soft,
  },
  logoutText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.error,
  },
});

export default ProfileScreen;
