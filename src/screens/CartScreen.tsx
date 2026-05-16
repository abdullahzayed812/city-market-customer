import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
} from 'react-native';
import { ChevronLeft, LogIn, UserPlus, ShoppingBag, ArrowRight } from 'lucide-react-native';
import { theme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartLogic } from '../features/cart/hooks/useCartLogic';
import { CartItem } from '../features/cart/components/CartItem';
import { CartEmptyState } from '../features/cart/components/CartEmptyState';
import { useAuth } from '../app/AuthContext';
import { useAnimatedPress } from '../hooks/useAnimatedPress';

const { width } = Dimensions.get('window');

const AuthModal = ({
  visible,
  onClose,
  onLogin,
  onRegister,
  t,
}: {
  visible: boolean;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
  t: any;
}) => {
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 16,
        bounciness: 6,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const { scaleValue: loginScale, onPressIn: loginIn, onPressOut: loginOut } = useAnimatedPress(0.96);
  const { scaleValue: regScale, onPressIn: regIn, onPressOut: regOut } = useAnimatedPress(0.96);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.modalCard, { transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.modalHandle} />
              <View style={styles.modalIconCircle}>
                <ShoppingBag size={30} color={theme.colors.primary} />
              </View>
              <Text style={styles.modalTitle}>
                {t('auth.login_required_title') || 'Login Required'}
              </Text>
              <Text style={styles.modalMessage}>
                {t('auth.login_required_message') ||
                  'Please sign in to place your order'}
              </Text>

              <TouchableOpacity
                style={styles.modalLoginBtn}
                onPress={onLogin}
                onPressIn={loginIn}
                onPressOut={loginOut}
                activeOpacity={1}
              >
                <Animated.View style={[styles.modalLoginBtnInner, { transform: [{ scale: loginScale }] }]}>
                  <LogIn size={18} color={theme.colors.white} />
                  <Text style={styles.modalLoginBtnText}>{t('common.login') || 'Login'}</Text>
                </Animated.View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalRegBtn}
                onPress={onRegister}
                onPressIn={regIn}
                onPressOut={regOut}
                activeOpacity={1}
              >
                <Animated.View style={[styles.modalRegBtnInner, { transform: [{ scale: regScale }] }]}>
                  <UserPlus size={18} color={theme.colors.primary} />
                  <Text style={styles.modalRegBtnText}>{t('common.register') || 'Register'}</Text>
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const CartScreen = ({ navigation }: any) => {
  const { isAuthenticated } = useAuth();
  const { items, total, removeFromCart, handleUpdateAmount, t } = useCartLogic();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { scaleValue, onPressIn, onPressOut } = useAnimatedPress(0.97);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      navigation.navigate('Checkout');
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />
        <View style={styles.emptyHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('cart.title')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <CartEmptyState t={t} onShopPress={() => navigation.navigate('Home')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('cart.title')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={items}
          renderItem={({ item }) => (
            <CartItem
              item={item}
              onRemove={removeFromCart}
              onUpdateAmount={handleUpdateAmount}
              t={t}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.footer}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('cart.subtotal') || 'Subtotal'}</Text>
              <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('checkout.delivery_fee') || 'Delivery'}</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                {t('common.free') || 'Free'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('cart.total')}</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleCheckout}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            activeOpacity={1}
          >
            <Animated.View style={[styles.checkoutBtn, { transform: [{ scale: scaleValue }] }]}>
              <Text style={styles.checkoutBtnText}>{t('cart.checkout')}</Text>
              <ArrowRight size={20} color={theme.colors.white} strokeWidth={2.5} />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={() => { setShowAuthModal(false); navigation.navigate('Login'); }}
        onRegister={() => { setShowAuthModal(false); navigation.navigate('Register'); }}
        t={t}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  emptyHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    ...theme.shadows.medium,
  },
  summaryCard: {
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: -0.5,
  },
  checkoutBtn: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: theme.radius.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    ...theme.shadows.medium,
  },
  checkoutBtnText: {
    color: theme.colors.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    padding: theme.spacing.xl,
    paddingBottom: 36,
    alignItems: 'center',
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primaryXLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  modalMessage: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: 16,
  },
  modalLoginBtn: {
    width: '100%',
    marginBottom: theme.spacing.sm,
  },
  modalLoginBtnInner: {
    height: 52,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...theme.shadows.soft,
  },
  modalLoginBtnText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  modalRegBtn: {
    width: '100%',
  },
  modalRegBtnInner: {
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
  modalRegBtnText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CartScreen;
