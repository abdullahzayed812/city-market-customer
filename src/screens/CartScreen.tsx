import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Trash2, ShoppingBag, ChevronLeft } from 'lucide-react-native';
import { useCart } from '../app/CartContext';
import { theme } from '../theme';
import { getBaseURL } from '../services/api/apiClient';
import QuantitySelector from '../components/common/QuantitySelector';
import { SafeAreaView } from 'react-native-safe-area-context';

const CartScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { items, removeFromCart, updateQuantity, total } = useCart();

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity);
    }
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      <Image
        source={{
          uri: item.imageUrl
            ? `${getBaseURL()}${item.imageUrl}`
            : 'https://via.placeholder.com/100',
        }}
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.name}
          </Text>
          <TouchableOpacity
            onPress={() => removeFromCart(item.id)}
            style={styles.removeButton}
          >
            <Trash2 size={20} color={theme.colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.itemFooter}>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
          <QuantitySelector
            quantity={item.quantity}
            onIncrement={() => handleUpdateQuantity(item.id, item.quantity + 1)}
            onDecrement={() => handleUpdateQuantity(item.id, item.quantity - 1)}
          />
        </View>
      </View>
    </View>
  );

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <View style={styles.emptyIconContainer}>
            <ShoppingBag size={80} color={theme.colors.surface} />
          </View>
          <Text style={styles.emptyText}>{t('cart.empty')}</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.shopButtonText}>{t('home.title')}</Text>
          </TouchableOpacity>
        </View>
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
          <View style={{ width: 40 }} /> {/* Spacer */}
        </View>

        <FlatList
          data={items}
          renderItem={renderCartItem}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
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
  cartItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background,
  },
  itemDetails: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemPrice: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondary,
  },
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
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textMuted,
  },
  summaryValue: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  totalValue: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondary,
  },
  checkoutButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  checkoutButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
  },
  emptyIconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  emptyText: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textMuted,
    marginBottom: 30,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
  },
  shopButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
  },
});

export default CartScreen;
