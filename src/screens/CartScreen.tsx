import React, { useState } from 'react';
import { View, StyleSheet, FlatList, StatusBar, Modal, Pressable } from 'react-native';
import {
  AppText as Text,
  Button,
  ScreenHeader,
  EmptyState,
  SummaryRow,
  palette,
  radii,
  space,
} from '@city-market/mobile-ui';
import { LogIn, UserPlus, ShoppingBag, ShoppingCart } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartLogic } from '../features/cart/hooks/useCartLogic';
import { CartItem } from '../features/cart/components/CartItem';
import { useAuth } from '../app/AuthContext';
import { useCart } from '../app/CartContext';
import { useFormat } from '../hooks/useFormat';

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
}) => (
  <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t('common.cancel')} />
      <View style={styles.modalCard}>
        <View style={styles.modalHandle} />
        <View style={styles.modalIconCircle}>
          <ShoppingBag size={30} color={palette.primary} />
        </View>
        <Text variant="title" color={palette.text} style={styles.center}>
          {t('auth.login_required_title')}
        </Text>
        <Text variant="body" color={palette.textMuted} style={[styles.center, styles.modalMessage]}>
          {t('auth.login_required_message')}
        </Text>
        <Button label={t('common.login')} icon={LogIn} size="lg" fullWidth onPress={onLogin} />
        <Button
          label={t('common.register')}
          icon={UserPlus}
          size="lg"
          variant="outline"
          fullWidth
          onPress={onRegister}
          style={styles.modalSecondBtn}
        />
      </View>
    </View>
  </Modal>
);

const CartScreen = ({ navigation }: any) => {
  const { isAuthenticated } = useAuth();
  const { items, total, removeFromCart, handleUpdateAmount, t } = useCartLogic();
  const { itemCount } = useCart();
  const { money } = useFormat();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      navigation.navigate('Checkout');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.surface} />
      <ScreenHeader
        title={t('cart.title')}
        subtitle={items.length > 0 ? t('cart.items_count', { count: itemCount }) : undefined}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title={t('cart.empty')}
          message={t('cart.empty_subtitle')}
          actionLabel={t('cart.browse_stores')}
          onAction={() => navigation.navigate('Home')}
        />
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={({ item }) => (
              <CartItem item={item} onRemove={removeFromCart} onUpdateAmount={handleUpdateAmount} t={t} />
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={Separator}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.footer}>
            <SummaryRow label={t('cart.subtotal')} value={money(total)} />
            <SummaryRow label={t('checkout.delivery_fee')} value={t('cart.delivery_at_checkout')} emphasis="muted" />
            <Button
              label={t('cart.continue')}
              size="lg"
              fullWidth
              onPress={handleCheckout}
              style={styles.checkoutBtn}
            />
          </View>
        </>
      )}

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={() => {
          setShowAuthModal(false);
          navigation.navigate('Login');
        }}
        onRegister={() => {
          setShowAuthModal(false);
          navigation.navigate('Register');
        }}
        t={t}
      />
    </SafeAreaView>
  );
};

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  listContent: {
    padding: space.lg,
  },
  separator: {
    height: space.md,
  },
  footer: {
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: space.lg,
    backgroundColor: palette.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.borderStrong,
  },
  checkoutBtn: {
    marginTop: space.md,
  },
  center: {
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: palette.overlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: space.xxl,
    paddingBottom: space.huge,
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.borderStrong,
    marginBottom: space.xl,
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: space.lg,
  },
  modalMessage: {
    marginTop: space.xs,
    marginBottom: space.xxl,
  },
  modalSecondBtn: {
    marginTop: space.md,
  },
});

export default CartScreen;
