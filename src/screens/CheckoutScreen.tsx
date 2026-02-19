import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  // Dimensions,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  MapPin,
  ChevronLeft,
  Check,
  Plus,
  CreditCard,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserService } from '../services/api/userService';
import { OrderService } from '../services/api/orderService';
import { useCart } from '../app/CartContext';
import { theme } from '../theme';

// const { width } = Dimensions.get('window');

const CheckoutScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { items, total, clearCart } = useCart();
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: UserService.getAddresses,
  });

  const orderMutation = useMutation({
    mutationFn: OrderService.createOrder,
    onSuccess: () => {
      clearCart();
      Toast.show({
        type: 'success',
        text1: t('checkout.success'),
        position: 'top',
      });
      navigation.replace('Main', { screen: 'Orders' });
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onError: error => {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error?.message || 'Failed to place order',
        position: 'top',
      });
    },
  });

  const handleConfirmOrder = () => {
    if (!selectedAddress) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Please select a delivery address',
        position: 'top',
      });
      return;
    }

    const address = addresses?.find((a: any) => a.id === selectedAddress);
    if (!address) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Selected address not found',
        position: 'top',
      });
      return;
    }

    const orderData = {
      vendorId: items[0].vendorId,
      items: items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      deliveryAddress: address.address,
      deliveryLatitude: address.latitude,
      deliveryLongitude: address.longitude,
    };

    orderMutation.mutate(orderData);
  };

  if (addressesLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const deliveryFee = 5.0;
  const grandTotal = total + deliveryFee;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('checkout.title')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Address Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('checkout.address')}</Text>
              <TouchableOpacity
                style={styles.addAddressHeaderButton}
                onPress={() => navigation.navigate('Addresses')}
              >
                <Plus size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            {addresses?.length === 0 ? (
              <TouchableOpacity
                style={styles.emptyAddressCard}
                onPress={() => navigation.navigate('Addresses')}
              >
                <MapPin size={32} color={theme.colors.surface} />
                <Text style={styles.emptyAddressText}>+ Add New Address</Text>
              </TouchableOpacity>
            ) : (
              addresses?.map((address: any) => (
                <TouchableOpacity
                  key={address.id}
                  style={[
                    styles.addressCard,
                    selectedAddress === address.id && styles.selectedAddress,
                  ]}
                  onPress={() => setSelectedAddress(address.id)}
                >
                  <View style={styles.addressIconContainer}>
                    <MapPin
                      size={22}
                      color={
                        selectedAddress === address.id
                          ? theme.colors.primary
                          : theme.colors.textMuted
                      }
                    />
                  </View>
                  <View style={styles.addressInfo}>
                    <Text
                      style={[
                        styles.addressLabel,
                        selectedAddress === address.id && styles.selectedText,
                      ]}
                    >
                      {address.label}
                    </Text>
                    <Text style={styles.addressText} numberOfLines={2}>
                      {address.address}
                    </Text>
                  </View>
                  {selectedAddress === address.id && (
                    <View style={styles.checkIconContainer}>
                      <Check size={18} color={theme.colors.white} />
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Payment Method (Mock) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentCard}>
              <View style={styles.paymentIconContainer}>
                <CreditCard size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentLabel}>Cash on Delivery</Text>
                <Text style={styles.paymentDesc}>
                  Pay when you receive your order
                </Text>
              </View>
              <View style={styles.radioActive}>
                <View style={styles.radioInner} />
              </View>
            </View>
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('cart.total')}</Text>
                <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {t('checkout.delivery_fee')}
                </Text>
                <Text style={styles.summaryValue}>
                  ${deliveryFee.toFixed(2)}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={[styles.summaryRow, { marginTop: 8 }]}>
                <Text style={styles.grandTotalLabel}>Grand Total</Text>
                <Text style={styles.grandTotalValue}>
                  ${grandTotal.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              orderMutation.isPending && styles.disabledButton,
            ]}
            onPress={handleConfirmOrder}
            disabled={orderMutation.isPending}
          >
            {orderMutation.isPending ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <Text style={styles.confirmButtonText}>
                {t('checkout.confirm_order')}
              </Text>
            )}
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
    backgroundColor: theme.colors.background,
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
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  addAddressHeaderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    ...theme.shadows.soft,
  },
  selectedAddress: {
    borderColor: theme.colors.primary,
    backgroundColor: '#F9FAF3', // Very light green tint
  },
  addressIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginBottom: 2,
  },
  selectedText: {
    color: theme.colors.primary,
  },
  addressText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
  },
  checkIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  emptyAddressCard: {
    backgroundColor: theme.colors.white,
    padding: 30,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.soft,
  },
  emptyAddressText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  paymentCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  paymentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  paymentDesc: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
  },
  radioActive: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  summaryCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    ...theme.shadows.soft,
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
  grandTotalLabel: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  grandTotalValue: {
    fontSize: theme.typography.sizes.xl,
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
  confirmButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  disabledButton: {
    backgroundColor: theme.colors.surface,
  },
  confirmButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
  },
});

export default CheckoutScreen;
