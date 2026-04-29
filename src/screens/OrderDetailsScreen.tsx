import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {
  ChevronLeft,
  Package,
  MapPin,
  Receipt,
  Clock,
  AlertCircle,
  Star,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { VendorRatingModal } from '../components/VendorRatingModal';
import { OrderStatusStepper } from '../components/OrderStatusStepper';
import CustomModal from '../components/common/CustomModal';
import {
  VendorOrder,
  VendorOrderItem,
  VendorOrderStatus,
  CustomerOrderStatus,
  OrderItemProposal,
} from '@city-market/shared';
import { styles } from './OrderDetailsScreen.styles';
import { useOrderDetails } from '../features/orders/hooks/useOrderDetails';

const OrderDetailsScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params;
  const {
    orderData,
    vendorOrders,
    statusConfig,
    date,
    isLoading,
    fetchedProposals,
    ratingModalVisible,
    setRatingModalVisible,
    selectedVendorForRating,
    handleRateVendor,
    getStatusConfig,
    handleConfirmOrder,
    handleCancelOrder,
    executeConfirmOrder,
    executeCancelOrder,
    isConfirming,
    isCancelling,
    confirmModalVisible,
    setConfirmModalVisible,
    cancelModalVisible,
    setCancelModalVisible,
    t,
  } = useOrderDetails(orderId);

  const [countdown, setCountdown] = useState('');
  const [isCountdownExpired, setIsCountdownExpired] = useState(false);

  useEffect(() => {
    if (
      orderData?.status !== CustomerOrderStatus.AWAITING_CUSTOMER_CONFIRMATION
    )
      return;
    const expiry = orderData?.confirmationExpiry
      ? new Date(orderData.confirmationExpiry)
      : null;
    if (!expiry) return;

    const tick = (intervalRef: ReturnType<typeof setInterval>) => {
      const diff = Math.max(0, expiry.getTime() - Date.now());
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      if (diff === 0) {
        setIsCountdownExpired(true);
        clearInterval(intervalRef);
      }
    };

    const interval = setInterval(() => tick(interval), 1000);
    tick(interval);
    return () => clearInterval(interval);
  }, [orderData?.status, orderData?.confirmationExpiry]);

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
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ width: 40 }} />
          <Text style={styles.title}>{t('orders.details_title')}</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Status Section */}
          <View style={styles.statusSection}>
            <View style={styles.statusHeader}>
              <View>
                <Text style={styles.orderIdText}>
                  {t('orders.order_number')}
                  {orderData?.id?.slice(-6)}
                </Text>
                <View style={styles.dateRow}>
                  <Clock size={14} color={theme.colors.textMuted} />
                  <Text style={styles.dateText}>
                    {date.toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusConfig.color + '15' },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: statusConfig.color },
                  ]}
                >
                  {orderData?.status
                    ? t(`orders.status_${orderData.status.toLowerCase()}`)
                    : ''}
                </Text>
              </View>
            </View>

            {orderData?.status ===
            CustomerOrderStatus.AWAITING_CUSTOMER_CONFIRMATION ? (
              <View style={styles.confirmationCard}>
                <Text style={styles.confirmationTitle}>
                  {t('orders.confirmation_required_title')}
                </Text>
                <Text style={styles.confirmationBody}>
                  {t('orders.confirmation_required_body')}
                </Text>
                {countdown ? (
                  <Text style={styles.countdownText}>
                    {t('orders.confirmation_expires_in')}: {countdown}
                  </Text>
                ) : null}

                {!isCountdownExpired && (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.confirmButton,
                        isConfirming && styles.buttonDisabled,
                      ]}
                      onPress={handleConfirmOrder}
                      disabled={isConfirming || isCancelling}
                    >
                      <CheckCircle size={18} color={theme.colors.white} />
                      <Text style={styles.confirmButtonText}>
                        {t('orders.confirm_order_button')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.cancelConfirmButton,
                        isCancelling && styles.buttonDisabled,
                      ]}
                      onPress={handleCancelOrder}
                      disabled={isConfirming || isCancelling}
                    >
                      <XCircle size={18} color={theme.colors.error} />
                      <Text style={styles.cancelConfirmButtonText}>
                        {t('orders.cancel_order_button')}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ) : (
              <View style={styles.stepperWrapper}>
                <OrderStatusStepper currentStatus={orderData?.status} />
              </View>
            )}

            {fetchedProposals.length > 0 && (
              <TouchableOpacity
                style={styles.reviewProposalsButton}
                onPress={() =>
                  navigation.navigate('ReviewProposals', { orderId })
                }
              >
                <AlertCircle size={20} color={theme.colors.white} />
                <Text style={styles.reviewProposalsText}>
                  {t('proposals.review_button')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Multi-Vendor Items Sections */}
          {vendorOrders.map(
            (
              vo: VendorOrder & {
                items: VendorOrderItem[];
                vendorName?: string;
                proposals?: OrderItemProposal[];
              },
            ) => (
              <View key={vo.id} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Package size={20} color={theme.colors.primary} />
                  <Text style={styles.sectionTitle}>
                    {vo.vendorName || t('common.vendor')}
                  </Text>
                  <View
                    style={[
                      styles.vendorStatusBadge,
                      {
                        backgroundColor:
                          getStatusConfig(vo.status).color + '20',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.vendorStatusText,
                        { color: getStatusConfig(vo.status).color },
                      ]}
                    >
                      {vo.status
                        ? t(`orders.status_${vo.status.toLowerCase()}`)
                        : ''}
                    </Text>
                  </View>
                </View>
                <View style={styles.itemsCard}>
                  {vo.items.map((item: VendorOrderItem, index: number) => (
                    <View
                      key={item.id}
                      style={[
                        styles.itemRow,
                        index === vo.items.length - 1 && {
                          borderBottomWidth: 0,
                        },
                      ]}
                    >
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.productName}</Text>
                        <View style={styles.weightContainer}>
                          {item.quantity ? (
                            <>
                              <Text style={styles.itemQty}>
                                {t('product.quantity')}: x{item.quantity}
                              </Text>
                              <Text style={styles.itemQty}>
                                {t('product.proposed_quantity')}: x
                                {item.proposedQuantity}
                              </Text>
                            </>
                          ) : (
                            <>
                              <Text style={styles.itemQty}>
                                {t('proposals.requested_weight')}: ≈{' '}
                                {(item.requestedWeightGrams! / 1000).toFixed(2)}{' '}
                                {t('common.kg')}
                              </Text>
                              {item.actualWeightGrams != null && (
                                <Text
                                  style={[
                                    styles.itemQty,
                                    styles.proposedWeightText,
                                  ]}
                                >
                                  {t('orders.actual_weight')}:{' '}
                                  {(item.actualWeightGrams / 1000).toFixed(2)}{' '}
                                  {t('common.kg')}
                                </Text>
                              )}
                            </>
                          )}
                        </View>
                      </View>
                      <Text style={styles.itemPrice}>
                        ${item.totalPrice.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
                {vo.status === VendorOrderStatus.DELIVERED && (
                  <TouchableOpacity
                    style={styles.rateButton}
                    onPress={() =>
                      handleRateVendor({
                        id: vo.vendorId,
                        name: vo.vendorName || t('common.vendor'),
                      })
                    }
                  >
                    <Star size={16} color={theme.colors.white} />
                    <Text style={styles.rateButtonText}>
                      {t('rating.rate_vendor_title')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ),
          )}

          {/* Delivery Address Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>{t('checkout.address')}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.addressText}>
                {orderData?.deliveryAddress}
              </Text>
            </View>
          </View>

          {/* Payment Summary Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Receipt size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>
                {t('orders.payment_summary')}
              </Text>
            </View>
            <View style={styles.card}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{t('cart.subtotal')}</Text>
                <Text style={styles.priceValue}>
                  ${orderData?.subtotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>
                  {t('checkout.delivery_fee')}
                </Text>
                <Text style={styles.priceValue}>
                  ${orderData?.deliveryFee.toFixed(2)}
                </Text>
              </View>
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>{t('cart.total')}</Text>
                <Text style={styles.totalValue}>
                  ${orderData?.totalAmount.toFixed(2)}
                </Text>
              </View>
            </View>
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
          visible={confirmModalVisible}
          onClose={() => setConfirmModalVisible(false)}
          title={t('orders.confirm_order_title')}
          message={t('orders.confirm_order_message')}
          confirmLabel={t('orders.confirm_order_button')}
          cancelLabel={t('common.cancel')}
          onConfirm={executeConfirmOrder}
          loading={isConfirming}
        />

        <CustomModal
          visible={cancelModalVisible}
          onClose={() => setCancelModalVisible(false)}
          title={t('orders.cancel_order_title')}
          message={t('orders.cancel_order_message')}
          confirmLabel={t('orders.cancel_order_button')}
          cancelLabel={t('common.no')}
          onConfirm={executeCancelOrder}
          confirmColor={theme.colors.error}
          loading={isCancelling}
        />
      </View>
    </SafeAreaView>
  );
};

export default OrderDetailsScreen;
