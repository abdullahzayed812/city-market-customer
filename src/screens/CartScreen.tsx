import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { theme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartLogic } from '../features/cart/hooks/useCartLogic';
import { CartItem } from '../features/cart/components/CartItem';
import { CartEmptyState } from '../features/cart/components/CartEmptyState';

const CartScreen = ({ navigation }: any) => {
  const { items, total, removeFromCart, handleUpdateAmount, t } = useCartLogic();

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <CartEmptyState t={t} onShopPress={() => navigation.navigate('Home')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={theme.colors.primary} />
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
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {t('cart.subtotal') || 'Subtotal'}
              </Text>
              <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('cart.total')}</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => navigation.navigate('Checkout')}
          >
            <Text style={styles.checkoutButtonText}>{t('cart.checkout')}</Text>
          </TouchableOpacity>
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
  listContent: { padding: theme.spacing.lg, paddingBottom: 20 },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    ...theme.shadows.medium,
  },
  summaryContainer: {
    marginBottom: theme.spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  summaryValue: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.secondary,
  },
  checkoutButton: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  checkoutButtonText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CartScreen;
