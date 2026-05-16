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
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  User,
  MapPin,
  Globe,
  LogOut,
  ChevronRight,
  Phone,
  HelpCircle,
  Shield,
  LogIn,
  UserPlus,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../app/AuthContext';
import { UserService } from '../services/api/userService';
import { AuthService } from '../services/api/authService';
import { theme } from '../theme';
import { useAnimatedPress } from '../hooks/useAnimatedPress';

const MenuItem = ({
  icon: Icon,
  label,
  value,
  onPress,
  isLast = false,
  color = theme.colors.primary,
  destructive = false,
}: any) => {
  const { scaleValue, onPressIn, onPressOut } = useAnimatedPress(0.98);
  const iconBg = destructive ? theme.colors.errorLight : color + '15';
  const labelColor = destructive ? theme.colors.error : theme.colors.textPrimary;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          styles.menuItem,
          !isLast && styles.menuItemBorder,
          { transform: [{ scale: scaleValue }] },
        ]}
      >
        <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>
          <Icon size={19} color={destructive ? theme.colors.error : color} />
        </View>
        <View style={styles.menuTextGroup}>
          <Text style={[styles.menuLabel, { color: labelColor }]}>{label}</Text>
          {value && <Text style={styles.menuValue}>{value}</Text>}
        </View>
        <ChevronRight size={18} color={theme.colors.border} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const GuestView = ({ navigation, t }: { navigation: any; t: any }) => {
  const { scaleValue: ls, onPressIn: li, onPressOut: lo } = useAnimatedPress(0.96);
  const { scaleValue: rs, onPressIn: ri, onPressOut: ro } = useAnimatedPress(0.96);

  return (
    <View style={styles.guestContainer}>
      <View style={styles.guestAvatarCircle}>
        <User size={40} color={theme.colors.primary} strokeWidth={1.5} />
      </View>
      <Text style={styles.guestTitle}>{t('auth.login_required_title') || 'Login Required'}</Text>
      <Text style={styles.guestMessage}>
        {t('auth.login_to_view_profile') || 'Login to view and manage your profile'}
      </Text>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} onPressIn={li} onPressOut={lo} activeOpacity={1} style={{ width: '100%', marginBottom: theme.spacing.sm }}>
        <Animated.View style={[styles.guestLoginBtn, { transform: [{ scale: ls }] }]}>
          <LogIn size={18} color={theme.colors.white} />
          <Text style={styles.guestLoginBtnText}>{t('common.login') || 'Login'}</Text>
        </Animated.View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')} onPressIn={ri} onPressOut={ro} activeOpacity={1} style={{ width: '100%' }}>
        <Animated.View style={[styles.guestRegBtn, { transform: [{ scale: rs }] }]}>
          <UserPlus size={18} color={theme.colors.primary} />
          <Text style={styles.guestRegBtnText}>{t('common.register') || 'Register'}</Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const ProfileScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const { signOut, isAuthenticated } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: UserService.getProfile,
  });

  const handleLogout = async () => {
    Alert.alert(
      t('common.logout'),
      t('common.logout_confirm') || 'Are you sure you want to logout?',
      [
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('common.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              const refreshToken = await AsyncStorage.getItem('refresh_token');
              if (refreshToken) await AuthService.logout(refreshToken);
              await signOut();
            } catch {
              Alert.alert(t('common.error'), t('common.logout_failed'));
            }
          },
        },
      ],
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('profile.title')}</Text>
          </View>
          <GuestView navigation={navigation} t={t} />
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const initials = profile?.fullName?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <View style={styles.heroSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.avatarRing} />
          </View>
          <Text style={styles.heroName}>{profile?.fullName}</Text>
          {profile?.phone && (
            <View style={styles.heroPhone}>
              <Phone size={13} color={theme.colors.textMuted} />
              <Text style={styles.heroPhoneText}>{profile.phone}</Text>
            </View>
          )}
        </View>

        {/* Stats card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile?.fullName?.split(' ').length ?? 1}</Text>
            <Text style={styles.statLabel}>{t('auth.full_name')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile?.phone ? '✓' : '—'}</Text>
            <Text style={styles.statLabel}>{t('auth.phone')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {i18n.language === 'ar' ? 'ع' : 'En'}
            </Text>
            <Text style={styles.statLabel}>{t('profile.language')}</Text>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.account_settings')}</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon={MapPin}
              label={t('profile.addresses')}
              onPress={() => navigation.navigate('Addresses')}
            />
            <MenuItem
              icon={Globe}
              label={t('profile.language')}
              value={i18n.language === 'ar' ? 'العربية' : 'English'}
              onPress={() => navigation.navigate('LanguageSettings')}
              isLast
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.support')}</Text>
          <View style={styles.menuCard}>
            <MenuItem icon={HelpCircle} label={t('common.help_center')} onPress={() => {}} />
            <MenuItem icon={Shield} label={t('common.account_privacy')} onPress={() => {}} isLast />
          </View>
        </View>

        {/* Logout */}
        <View style={[styles.section, { marginBottom: 48 }]}>
          <View style={styles.menuCard}>
            <MenuItem
              icon={LogOut}
              label={t('common.logout')}
              onPress={handleLogout}
              destructive
              isLast
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.white },
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.4,
  },
  heroSection: {
    backgroundColor: theme.colors.white,
    paddingTop: 32,
    paddingBottom: 28,
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarRing: {
    position: 'absolute',
    inset: -4,
    borderRadius: 58,
    borderWidth: 2,
    borderColor: theme.colors.primaryLight,
    borderStyle: 'dashed',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: 36,
    fontWeight: '800',
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 5,
  },
  heroPhone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroPhoneText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  statsCard: {
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.lg,
    marginTop: -16,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.medium,
    marginBottom: theme.spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: theme.colors.border,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    ...theme.shadows.soft,
  },
  menuItem: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextGroup: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  menuValue: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 1,
    fontWeight: '500',
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  guestAvatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.primaryXLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  guestMessage: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.xl,
  },
  guestLoginBtn: {
    height: 52,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...theme.shadows.soft,
  },
  guestLoginBtnText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  guestRegBtn: {
    height: 52,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  guestRegBtnText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProfileScreen;
