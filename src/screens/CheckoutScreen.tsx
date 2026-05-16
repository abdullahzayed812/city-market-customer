import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Animated,
} from 'react-native';
import {
  MapPin,
  ChevronLeft,
  Check,
  Plus,
  CreditCard,
  Ban,
  ArrowRight,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { useCheckout } from '../features/cart/hooks/useCheckout';
import { useAnimatedPress } from '../hooks/useAnimatedPress';

const CheckoutScreen = ({ navigation }: any) => {
  const {
    t,
    total,
    selectedAddress,
    setSelectedAddress,
    addresses,
    addressesLoading,
    orderMutation,
    handleConfirmOrder,
    deliveryFee,
    deliveryFeeLoading,
    grandTotal,
    hasPenalty,
  } = useCheckout(navigation);

  const { scaleValue, onPressIn, onPressOut } = useAnimatedPress(0.97);

  if (addressesLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const isDisabled = orderMutation.isPending || hasPenalty || !selectedAddress;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('checkout.title')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Address Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('checkout.address')}</Text>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => navigation.navigate('Addresses')}
              >
                <Plus size={16} color={theme.colors.primary} />
                <Text style={styles.addBtnText}>{t('addresses.add_new') || 'Add'}</Text>
              </TouchableOpacity>
            </View>

            {addresses?.length === 0 ? (
              <TouchableOpacity
                style={styles.emptyAddressCard}
                onPress={() => navigation.navigate('Addresses')}
              >
                <View style={styles.emptyAddressIcon}>
                  <MapPin size={28} color={theme.colors.primary} />
                </View>
                <Text style={styles.emptyAddressText}>{t('addresses.add_new')}</Text>
                <Text style={styles.emptyAddressHint}>
                  {t('addresses.add_hint') || 'Add a delivery address to continue'}
                </Text>
              </TouchableOpacity>
            ) : (
              addresses?.map((address: any) => {
                const isSelected = selectedAddress === address.id;
                return (
                  <TouchableOpacity
                    key={address.id}
                    style={[styles.addressCard, isSelected && styles.addressCardSelected]}
                    onPress={() => setSelectedAddress(address.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.addressIconBox, isSelected && styles.addressIconBoxSelected]}>
                      <MapPin size={20} color={isSelected ? theme.colors.white : theme.colors.textMuted} />
                    </View>
                    <View style={styles.addressInfo}>
                      <Text style={[styles.addressLabel, isSelected && styles.addressLabelSelected]}>
                        {address.label}
                      </Text>
                      <Text style={styles.addressText} numberOfLines={2}>
                        {address.address}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={styles.checkCircle}>
                        <Check size={14} color={theme.colors.white} strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('checkout.payment_method')}</Text>
            {hasPenalty ? (
              <View style={styles.penaltyBanner}>
                <Ban size={20} color={theme.colors.error} />
                <View style={styles.penaltyText}>
                  <Text style={styles.penaltyTitle}>{t('checkout.cod_blocked_title')}</Text>
                  <Text style={styles.penaltyDesc}>{t('checkout.cod_blocked_desc')}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.paymentCard}>
                <View style={styles.paymentIconBox}>
                  <CreditCard size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentLabel}>{t('checkout.cash_on_delivery')}</Text>
                  <Text style={styles.paymentDesc}>{t('checkout.cash_description')}</Text>
                </View>
                <View style={styles.radioOuter}>
                  <View style={styles.radioInner} />
                </View>
              </View>
            )}
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('checkout.order_summary')}</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('cart.total')}</Text>
                <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('checkout.delivery_fee')}</Text>
                <View style={styles.deliveryFeeRow}>
                  {deliveryFeeLoading && (
                    <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginRight: 6 }} />
                  )}
                  <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.grandRow}>
                <Text style={styles.grandLabel}>{t('checkout.grand_total')}</Text>
                <Text style={styles.grandValue}>${grandTotal.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 16 }} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleConfirmOrder}
            onPressIn={!isDisabled ? onPressIn : undefined}
            onPressOut={!isDisabled ? onPressOut : undefined}
            disabled={isDisabled}
            activeOpacity={1}
          >
            <Animated.View
              style={[
                styles.confirmBtn,
                isDisabled && styles.confirmBtnDisabled,
                { transform: [{ scale: isDisabled ? 1 : scaleValue }] },
              ]}
            >
              {orderMutation.isPending ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <>
                  <Text style={styles.confirmBtnText}>{t('checkout.confirm_order')}</Text>
                  <ArrowRight size={20} color={theme.colors.white} strokeWidth={2.5} />
                </>
              )}
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  scrollContent: {
    paddingBottom: 8,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    letterSpacing: -0.2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primaryXLight,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  emptyAddressCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  emptyAddressIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primaryXLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyAddressText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  emptyAddressHint: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...theme.shadows.soft,
  },
  addressCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryXLight,
  },
  addressIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: theme.colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  addressIconBoxSelected: {
    backgroundColor: theme.colors.primary,
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  addressLabelSelected: {
    color: theme.colors.primary,
  },
  addressText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  penaltyBanner: {
    flexDirection: 'row',
    backgroundColor: theme.colors.errorLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    alignItems: 'flex-start',
    gap: 12,
  },
  penaltyText: {
    flex: 1,
  },
  penaltyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.error,
    marginBottom: 3,
  },
  penaltyDesc: {
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 18,
  },
  paymentCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    ...theme.shadows.soft,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  paymentIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryXLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  paymentDesc: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 11,
    height: 11,
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
    marginBottom: 10,
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
  deliveryFeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  grandValue: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: -0.5,
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
  confirmBtn: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: theme.radius.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    ...theme.shadows.medium,
  },
  confirmBtnDisabled: {
    backgroundColor: theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmBtnText: {
    color: theme.colors.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});

export default CheckoutScreen;
