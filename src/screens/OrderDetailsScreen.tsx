import React from 'react';
import { View, ScrollView, ActivityIndicator, Pressable, StatusBar, RefreshControl } from 'react-native';
import {
  AppText as Text,
  Button,
  Card,
  ScreenHeader,
  SectionHeader,
  StatusBadge,
  SummaryRow,
  Divider,
  LoadingState,
  ForwardIcon,
  shortId,
  palette,
} from '@city-market/mobile-ui';
import { Store, MapPin, Receipt, Clock, FileQuestion, Star, XCircle, Ban, Timer, Bike } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VendorRatingModal } from '../components/VendorRatingModal';
import { OrderStatusStepper } from '../components/OrderStatusStepper';
import { CourierCard } from '../components/CourierCard';
import CustomModal from '../components/common/CustomModal';
import QueryError from '../components/common/QueryError';
import { VendorOrder, VendorOrderItem, VendorOrderStatus, OrderItemProposal, ProposalStatus } from '@city-market/shared';
import { styles } from './OrderDetailsScreen.styles';
import { useOrderDetails } from '../features/orders/hooks/useOrderDetails';
import { orderStatusMeta } from '../features/orders/orderStatus';
import { useFormat } from '../hooks/useFormat';

type VendorOrderWithItems = VendorOrder & {
  items: VendorOrderItem[];
  vendorName?: string;
  proposals?: OrderItemProposal[];
};

const OrderDetailsScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params;
  const {
    orderData,
    vendorOrders,
    date,
    isLoading,
    refetch,
    isRefetching,
    fetchedProposals,
    ratingModalVisible,
    setRatingModalVisible,
    selectedVendorForRating,
    handleRateVendor,
    customerDecisionCountdown,
    cancelledVendorPendingDecision,
    cancellationDecisionModalVisible,
    setCancellationDecisionModalVisible,
    resolveCancellationMutation,
    couriers,
    vendorRatingFor,
    error,
    t,
  } = useOrderDetails(orderId);
  const { money, weight } = useFormat();

  const header = (
    <ScreenHeader
      title={t('orders.details_title')}
      subtitle={orderData ? shortId(orderData.id) : undefined}
      onBack={() => navigation.goBack()}
      backLabel={t('common.back')}
    />
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {header}
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (!orderData) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {header}
        <QueryError error={error} onRetry={refetch} retrying={isRefetching} />
      </SafeAreaView>
    );
  }

  const status = orderStatusMeta(orderData.status);
  const pendingProposals = (fetchedProposals as OrderItemProposal[]).filter(p => p.status === ProposalStatus.PENDING).length;
  const showCountdown = customerDecisionCountdown.remainingSeconds > 0 && !customerDecisionCountdown.isExpired;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.surface} />
      {header}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={palette.primary} colors={[palette.primary]} />
        }
      >
        {/* Status */}
        <Card>
          <View style={styles.statusHeader}>
            <StatusBadge
              label={t(`orders.status_${orderData.status.toLowerCase()}`)}
              tone={status.tone}
              icon={status.icon}
            />
            <View style={styles.dateRow}>
              <Clock size={14} color={palette.textMuted} />
              <Text variant="caption" color={palette.textMuted}>
                {date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </Text>
            </View>
          </View>
          <Divider />
          <OrderStatusStepper currentStatus={orderData.status} />
        </Card>

        {/* Decisions the customer must take come right after the status. */}
        {showCountdown ? (
          <View style={[styles.banner, customerDecisionCountdown.isWarning ? styles.bannerError : styles.bannerWarning]}>
            <Timer size={20} color={customerDecisionCountdown.isWarning ? palette.error : palette.warning} />
            <Text variant="label" color={palette.text} style={styles.flex}>
              {t('orders.decide_before', 'Decide before')}
            </Text>
            <Text variant="heading" color={customerDecisionCountdown.isWarning ? palette.error : palette.warning} style={styles.tabular}>
              {customerDecisionCountdown.formattedTime}
            </Text>
          </View>
        ) : null}

        {fetchedProposals.length > 0 ? (
          <Pressable
            style={({ pressed }) => [styles.actionCard, pendingProposals > 0 && styles.actionCardUrgent, pressed && styles.pressed]}
            onPress={() => navigation.navigate('ReviewProposals', { orderId })}
            accessibilityRole="button"
          >
            <View style={[styles.actionIcon, pendingProposals > 0 && styles.actionIconUrgent]}>
              <FileQuestion size={22} color={pendingProposals > 0 ? palette.white : palette.primary} />
            </View>
            <View style={styles.flex}>
              <Text variant="subheading" color={palette.text}>{t('proposals.review_button')}</Text>
              {pendingProposals > 0 ? (
                <Text variant="caption" color={palette.warning}>
                  {t('proposals.pending_count', { count: pendingProposals })}
                </Text>
              ) : null}
            </View>
            <ForwardIcon size={20} color={palette.textMuted} />
          </Pressable>
        ) : null}

        {cancelledVendorPendingDecision ? (
          <Pressable
            style={({ pressed }) => [styles.actionCard, styles.actionCardDanger, pressed && styles.pressed]}
            onPress={() => setCancellationDecisionModalVisible(true)}
            accessibilityRole="button"
          >
            <View style={[styles.actionIcon, styles.actionIconDanger]}>
              <Ban size={22} color={palette.white} />
            </View>
            <Text variant="label" color={palette.text} style={styles.flex}>
              {t('orders.vendor_cancelled_decision_banner', {
                vendor: cancelledVendorPendingDecision.vendorName || t('common.vendor'),
              })}
            </Text>
            <ForwardIcon size={20} color={palette.textMuted} />
          </Pressable>
        ) : null}

        {orderData.cancellationReason ? (
          <View style={[styles.banner, styles.bannerError]}>
            <Ban size={18} color={palette.error} />
            <View style={styles.flex}>
              <Text variant="label" color={palette.error}>{t('orders.cancellation_reason')}</Text>
              <Text variant="body" color={palette.text}>{orderData.cancellationReason}</Text>
            </View>
          </View>
        ) : null}

        {/* Courier */}
        {couriers.length > 0 ? (
          <View>
            <SectionHeader title={t(couriers.length > 1 ? 'courier.title_plural' : 'courier.title')} icon={Bike} />
            {couriers.map((delivery, index) => (
              <CourierCard
                key={delivery.deliveryId}
                orderId={orderId}
                delivery={delivery}
                position={{ index, total: couriers.length }}
              />
            ))}
          </View>
        ) : null}

        {/* Items per store */}
        {(vendorOrders as VendorOrderWithItems[]).map(vo => {
          const voStatus = orderStatusMeta(vo.status);
          const myRating = vendorRatingFor(vo.vendorId);
          return (
            <View key={vo.id}>
              <SectionHeader
                title={vo.vendorName || t('common.vendor')}
                icon={Store}
                trailing={
                  vo.status ? (
                    <StatusBadge
                      label={t(`orders.status_${vo.status.toLowerCase()}`)}
                      tone={voStatus.tone}
                      icon={voStatus.icon}
                      size="sm"
                    />
                  ) : null
                }
              />
              <Card padded={false}>
                {vo.items.map((item, index) => {
                  const isWeighed = !item.quantity;
                  const quantityChanged = item.proposedQuantity != null && item.proposedQuantity !== item.quantity;
                  return (
                    <View key={item.id} style={[styles.itemRow, index > 0 && styles.itemRowBorder]}>
                      <View style={styles.flex}>
                        <Text variant="body" color={palette.text}>{item.productName}</Text>
                        {isWeighed ? (
                          <Text variant="caption" color={palette.textMuted}>
                            {t('proposals.requested_weight')}: ≈ {weight(item.requestedWeightGrams)}
                            {item.actualWeightGrams != null
                              ? `  ·  ${t('orders.actual_weight')}: ${weight(item.actualWeightGrams)}`
                              : ''}
                          </Text>
                        ) : (
                          <Text variant="caption" color={palette.textMuted}>
                            {t('product.quantity')}: × {item.quantity}
                            {quantityChanged ? `  ·  ${t('product.proposed_quantity')}: × ${item.proposedQuantity}` : ''}
                          </Text>
                        )}
                      </View>
                      <Text variant="bodyStrong" color={palette.text} style={styles.tabular}>
                        {money(item.totalPrice)}
                      </Text>
                    </View>
                  );
                })}
              </Card>

              {vo.cancellationReason ? (
                <View style={[styles.banner, styles.bannerError, styles.bannerTight]}>
                  <XCircle size={16} color={palette.error} />
                  <Text variant="caption" color={palette.text} style={styles.flex}>
                    {t('orders.cancellation_reason')}: {vo.cancellationReason}
                  </Text>
                </View>
              ) : null}

              {vo.status === VendorOrderStatus.DELIVERED ? (
                myRating ? (
                  <View style={styles.ratedRow}>
                    <Text variant="caption" color={palette.textMuted}>{t('courier.your_rating')}</Text>
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star
                        key={n}
                        size={16}
                        color={palette.accent}
                        fill={n <= (myRating.stars ?? 0) ? palette.accent : 'transparent'}
                      />
                    ))}
                  </View>
                ) : (
                  <Button
                    label={t('rating.rate_vendor_title')}
                    icon={Star}
                    variant="secondary"
                    size="sm"
                    style={styles.rateButton}
                    onPress={() => handleRateVendor({ id: vo.vendorId, name: vo.vendorName || t('common.vendor') })}
                  />
                )
              ) : null}
            </View>
          );
        })}

        {/* Address */}
        <View>
          <SectionHeader title={t('checkout.address')} icon={MapPin} />
          <Card>
            <Text variant="body" color={palette.text}>{orderData.deliveryAddress}</Text>
          </Card>
        </View>

        {/* Payment */}
        <View>
          <SectionHeader title={t('orders.payment_summary')} icon={Receipt} />
          <Card>
            <SummaryRow label={t('checkout.items_subtotal')} value={money(orderData.subtotal)} />
            <SummaryRow label={t('checkout.delivery_fee')} value={money(orderData.deliveryFee)} />
            <Divider />
            <SummaryRow label={t('cart.total')} value={money(orderData.totalAmount)} emphasis="total" />
          </Card>
        </View>
      </ScrollView>

      {selectedVendorForRating && (
        <VendorRatingModal
          visible={ratingModalVisible}
          onClose={() => setRatingModalVisible(false)}
          vendorId={selectedVendorForRating.id}
          vendorName={selectedVendorForRating.name}
          orderId={orderId}
        />
      )}

      <CustomModal
        visible={cancellationDecisionModalVisible}
        onClose={() => setCancellationDecisionModalVisible(false)}
        title={t('orders.vendor_cancelled_title')}
        message={t('orders.vendor_cancelled_message', {
          vendor: cancelledVendorPendingDecision?.vendorName || t('common.vendor'),
        })}
      >
        <Pressable
          style={styles.continueVendorButton}
          onPress={() => resolveCancellationMutation.mutate(true)}
          disabled={resolveCancellationMutation.isPending}
          accessibilityRole="button"
        >
          {resolveCancellationMutation.isPending ? (
            <ActivityIndicator size="small" color={palette.primary} />
          ) : (
            <Text variant="subheading" color={palette.primary}>{t('orders.continue_without_vendor')}</Text>
          )}
        </Pressable>
        <Pressable
          style={styles.cancelEntireOrderButton}
          onPress={() => resolveCancellationMutation.mutate(false)}
          disabled={resolveCancellationMutation.isPending}
          accessibilityRole="button"
        >
          {resolveCancellationMutation.isPending ? (
            <ActivityIndicator size="small" color={palette.white} />
          ) : (
            <Text variant="subheading" color={palette.white}>{t('orders.cancel_entire_order')}</Text>
          )}
        </Pressable>
      </CustomModal>
    </SafeAreaView>
  );
};

export default OrderDetailsScreen;
