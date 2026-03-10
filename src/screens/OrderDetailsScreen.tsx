import React, { useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  Package,
  MapPin,
  Receipt,
  Clock,
  AlertCircle,
  Star,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrderService } from '../services/api/orderService';
import { theme } from '../theme';
import { useSocket } from '../app/SocketContext';
import { VendorRatingModal } from '../components/VendorRatingModal';
import {
  OrderWithItems,
  VendorOrder,
  VendorOrderItem,
  CustomerOrderStatus,
  VendorOrderStatus,
  EventType,
  OrderItemProposal,
} from '@city-market/shared';

const OrderDetailsScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params;
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [ratingModalVisible, setRatingModalVisible] = React.useState(false);
  const [selectedVendorForRating, setSelectedVendorForRating] =
    React.useState<any>(null);

  const { data: order, isLoading } = useQuery<OrderWithItems | undefined>({
    queryKey: ['order', orderId],
    queryFn: () => OrderService.getOrderById(orderId),
  });

  const handleUpdate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['order', orderId] });
  }, [queryClient, orderId]);

  const socketEvents = useMemo(
    () => [
      EventType.VENDOR_ORDER_PROPOSED,
      EventType.ORDER_CREATED,
      EventType.ORDER_CONFIRMED,
      EventType.ORDER_CANCELLED,
      EventType.ORDER_READY,
      EventType.ORDER_PICKED_UP,
      EventType.ORDER_ON_THE_WAY,
      EventType.ORDER_DELIVERED,
      EventType.PROPOSAL_ACCEPTED,
      EventType.PROPOSAL_REJECTED,
    ],
    [],
  );

  useEffect(() => {
    if (!socket) return;

    socketEvents.forEach(event => socket.on(event, handleUpdate));

    return () => {
      socketEvents.forEach(event => socket.off(event, handleUpdate));
    };
  }, [socket, handleUpdate, socketEvents]);

  const getStatusConfig = useCallback(
    (status: CustomerOrderStatus | VendorOrderStatus | undefined) => {
      if (!status) {
        return { color: theme.colors.textMuted };
      }
      switch (status) {
        case CustomerOrderStatus.PENDING_VENDOR_CONFIRMATION:
        case CustomerOrderStatus.WAITING_CUSTOMER_DECISION:
        case VendorOrderStatus.PENDING:
        case VendorOrderStatus.PROPOSAL_SENT:
          return { color: '#FF9500' };
        case CustomerOrderStatus.READY:
        case CustomerOrderStatus.IN_DELIVERY:
        case VendorOrderStatus.CONFIRMED:
        case VendorOrderStatus.PICKED_UP:
        case VendorOrderStatus.ON_THE_WAY:
          return { color: theme.colors.primary };
        case CustomerOrderStatus.COMPLETED:
        case VendorOrderStatus.DELIVERED:
          return { color: theme.colors.success };
        case CustomerOrderStatus.CANCELLED:
        case VendorOrderStatus.CANCELLED:
          return { color: theme.colors.error };
        default:
          return { color: theme.colors.textMuted };
      }
    },
    [],
  );

  const orderData = order?.order;
  const vendorOrders = order?.vendorOrders || [];
  const statusConfig = useMemo(
    () => getStatusConfig(orderData?.status),
    [orderData?.status, getStatusConfig],
  );
  const date = useMemo(
    () => (orderData ? new Date(orderData.createdAt) : new Date()),
    [orderData],
  );

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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('orders.details_title')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Status Section */}
          <View style={styles.statusSection}>
            <View
              style={[
                styles.statusIconContainer,
                { backgroundColor: statusConfig.color + '15' },
              ]}
            >
              <Package size={40} color={statusConfig.color} />
            </View>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {orderData?.status
                ? t(`orders.status_${orderData.status.toLowerCase()}`)
                : ''}
            </Text>
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

            {vendorOrders.some(vo =>
              vo.items.some(item => item.actualWeightGrams != null),
            ) && (
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
                            <Text style={styles.itemQty}>
                              {t('product.quantity')}: x{item.quantity}
                            </Text>
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
                    onPress={() => {
                      setSelectedVendorForRating({
                        id: vo.vendorId,
                        name: vo.vendorName || t('common.vendor'),
                      });
                      setRatingModalVisible(true);
                    }}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  statusSection: {
    backgroundColor: theme.colors.white,
    padding: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  statusIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  orderIdText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginLeft: 5,
  },
  section: {
    marginTop: 15,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginLeft: 10,
    flex: 1,
  },
  vendorStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  vendorStatusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  itemsCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 15,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  itemQty: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  priceValue: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  addressText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
  reviewProposalsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9500',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  reviewProposalsText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  rateButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  weightContainer: {
    marginTop: 2,
  },
  proposedWeightText: {
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default OrderDetailsScreen;
