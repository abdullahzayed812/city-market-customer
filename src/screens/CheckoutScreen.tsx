import React from 'react';
import { View, StyleSheet, Pressable, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import {
  AppText as Text,
  Button,
  Card,
  ScreenHeader,
  SectionHeader,
  SummaryRow,
  Divider,
  LoadingState,
  palette,
  radii,
  space,
} from '@city-market/mobile-ui';
import { MapPin, Plus, Banknote, Ban, Receipt, ShoppingBasket } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MeasurementType } from '@city-market/shared';
import { useCheckout } from '../features/cart/hooks/useCheckout';
import QueryError from '../components/common/QueryError';
import { useFormat } from '../hooks/useFormat';

const Radio = ({ selected }: { selected: boolean }) => (
  <View style={[styles.radioOuter, selected && styles.radioOuterOn]}>
    {selected ? <View style={styles.radioInner} /> : null}
  </View>
);

const CheckoutScreen = ({ navigation }: any) => {
  const {
    t,
    items,
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
    deliveryFeeKnown,
    addressesError,
    refetchAddresses,
    hasPenalty,
  } = useCheckout(navigation);
  const { money, weight } = useFormat();

  const header = (
    <ScreenHeader title={t('checkout.title')} onBack={() => navigation.goBack()} backLabel={t('common.back')} />
  );

  if (addressesLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {header}
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (addressesError && !addresses) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {header}
        <QueryError error={addressesError} onRetry={refetchAddresses} />
      </SafeAreaView>
    );
  }

  const isDisabled = hasPenalty || !selectedAddress;
  const feeValue = deliveryFeeKnown
    ? money(deliveryFee)
    : deliveryFeeLoading
      ? t('checkout.fee_calculating')
      : t('checkout.fee_pending');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.surface} />
      {header}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Address */}
        <SectionHeader
          title={t('checkout.address')}
          icon={MapPin}
          actionLabel={addresses?.length ? t('checkout.add_address') : undefined}
          onAction={() => navigation.navigate('Addresses')}
        />
        {!addresses?.length ? (
          <Pressable
            style={({ pressed }) => [styles.emptyAddress, pressed && styles.pressed]}
            onPress={() => navigation.navigate('Addresses')}
            accessibilityRole="button"
          >
            <View style={styles.emptyAddressIcon}>
              <Plus size={22} color={palette.primary} />
            </View>
            <Text variant="subheading" color={palette.primary}>{t('addresses.add_new')}</Text>
            <Text variant="caption" color={palette.textMuted} style={styles.center}>
              {t('addresses.add_hint')}
            </Text>
          </Pressable>
        ) : (
          <View style={styles.stack}>
            {addresses.map((address: any) => {
              const isSelected = selectedAddress === address.id;
              return (
                <Pressable
                  key={address.id}
                  style={({ pressed }) => [styles.addressCard, isSelected && styles.addressCardSelected, pressed && styles.pressed]}
                  onPress={() => setSelectedAddress(address.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                >
                  <Radio selected={isSelected} />
                  <View style={styles.flex}>
                    <Text variant="label" color={palette.text}>{address.label}</Text>
                    <Text variant="caption" color={palette.textMuted} numberOfLines={2}>
                      {address.address}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Items */}
        <SectionHeader title={t('checkout.order_summary')} icon={ShoppingBasket} style={styles.sectionGap} />
        <Card>
          {items.map((item, index) => {
            const isWeight = item.measurementType === MeasurementType.WEIGHT;
            const line = isWeight ? (item.price * (item.weightGrams || 0)) / 1000 : item.price * (item.quantity || 0);
            return (
              <View key={item.id} style={[styles.itemRow, index > 0 && styles.itemRowBorder]}>
                <Text variant="body" color={palette.text} numberOfLines={2} style={styles.flex}>
                  {item.name}
                </Text>
                <Text variant="caption" color={palette.textMuted} style={styles.qty}>
                  {isWeight ? weight(item.weightGrams) : `× ${item.quantity}`}
                </Text>
                <Text variant="bodyStrong" color={palette.text} style={styles.tabular}>
                  {money(line)}
                </Text>
              </View>
            );
          })}
        </Card>

        {/* Payment */}
        <SectionHeader title={t('checkout.payment_method')} icon={Banknote} style={styles.sectionGap} />
        {hasPenalty ? (
          <View style={styles.penaltyBanner} accessibilityRole="alert">
            <Ban size={20} color={palette.error} />
            <View style={styles.flex}>
              <Text variant="label" color={palette.error}>{t('checkout.cod_blocked_title')}</Text>
              <Text variant="caption" color={palette.textSecondary}>{t('checkout.cod_blocked_desc')}</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.addressCard, styles.addressCardSelected]}>
            <Radio selected />
            <View style={styles.flex}>
              <Text variant="label" color={palette.text}>{t('checkout.cash_on_delivery')}</Text>
              <Text variant="caption" color={palette.textMuted}>{t('checkout.pay_on_delivery_note')}</Text>
            </View>
            <Banknote size={22} color={palette.primary} />
          </View>
        )}

        {/* Totals */}
        <SectionHeader title={t('orders.payment_summary')} icon={Receipt} style={styles.sectionGap} />
        <Card>
          <SummaryRow label={t('checkout.items_subtotal')} value={money(total)} />
          <SummaryRow
            label={t('checkout.delivery_fee')}
            value={feeValue}
            emphasis={deliveryFeeKnown ? 'normal' : 'muted'}
            trailing={deliveryFeeLoading ? <ActivityIndicator size="small" color={palette.primary} /> : undefined}
          />
          <Divider />
          <SummaryRow
            label={t('checkout.grand_total')}
            value={deliveryFeeKnown ? money(grandTotal) : '—'}
            emphasis="total"
          />
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={deliveryFeeKnown ? `${t('checkout.confirm_order')} · ${money(grandTotal)}` : t('checkout.confirm_order')}
          size="lg"
          fullWidth
          loading={orderMutation.isPending}
          disabled={isDisabled}
          onPress={handleConfirmOrder}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scrollContent: {
    padding: space.lg,
    paddingBottom: space.xxl,
  },
  sectionGap: {
    marginTop: space.xxl,
  },
  stack: {
    gap: space.sm,
  },
  flex: {
    flex: 1,
  },
  center: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  emptyAddress: {
    alignItems: 'center',
    gap: space.xs,
    padding: space.xl,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: palette.primaryMuted,
    backgroundColor: palette.surface,
  },
  emptyAddressIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.xs,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    borderWidth: 1.5,
    borderColor: palette.border,
  },
  addressCardSelected: {
    borderColor: palette.primary,
    backgroundColor: palette.primarySoft,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: palette.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterOn: {
    borderColor: palette.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.primary,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.sm,
  },
  itemRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
  },
  qty: {
    minWidth: 40,
    textAlign: 'center',
  },
  penaltyBanner: {
    flexDirection: 'row',
    gap: space.md,
    padding: space.lg,
    borderRadius: radii.lg,
    backgroundColor: palette.errorSoft,
  },
  footer: {
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    backgroundColor: palette.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.borderStrong,
  },
});

export default CheckoutScreen;
