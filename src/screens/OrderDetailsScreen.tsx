import React, { useEffect } from 'react';
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
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrderService } from '../services/api/orderService';
import { theme } from '../theme';
import { useSocket } from '../app/SocketContext';

const OrderDetailsScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params;
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => OrderService.getOrderById(orderId),
  });

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['order'] });
    };

    const events = [
      'ORDER_CREATED',
      'ORDER_CONFIRMED',
      'ORDER_CANCELLED',
      'ORDER_READY',
      'ORDER_PICKED_UP',
      'ORDER_ON_THE_WAY',
      'ORDER_DELIVERED',
    ];

    events.forEach(event => socket.on(event, handleUpdate));

    return () => {
      events.forEach(event => socket.off(event, handleUpdate));
    };
  }, [socket, queryClient]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const orderData = order?.order;
  const vendorOrders = order?.vendorOrders || [];
  const statusConfig = getStatusConfig(orderData?.status);
  const date = orderData ? new Date(orderData.createdAt) : new Date();

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
          <Text style={styles.title}>
            {t('orders.details_title') || 'Order Details'}
          </Text>
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
              {orderData?.status}
            </Text>
            <Text style={styles.orderIdText}>
              Order #{orderData?.id?.slice(-6)}
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

            {vendorOrders.some((vo: any) => vo.proposals && vo.proposals.length > 0) && (
              <TouchableOpacity
                style={styles.reviewProposalsButton}
                onPress={() => navigation.navigate('ReviewProposals', { orderId })}
              >
                <AlertCircle size={20} color={theme.colors.white} />
                <Text style={styles.reviewProposalsText}>
                  {t('proposals.review_button') || 'Review Vendor Proposals'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Multi-Vendor Items Sections */}
          {vendorOrders.map((vo: any) => (
            <View key={vo.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Package size={20} color={theme.colors.primary} />
                <Text style={styles.sectionTitle}>
                  {vo.vendorName}
                </Text>
                <View style={[styles.vendorStatusBadge, { backgroundColor: getStatusConfig(vo.status).color + '20' }]}>
                  <Text style={[styles.vendorStatusText, { color: getStatusConfig(vo.status).color }]}>{vo.status}</Text>
                </View>
              </View>
              <View style={styles.itemsCard}>
                {vo.items.map((item: any, index: number) => (
                  <View
                    key={item.id}
                    style={[
                      styles.itemRow,
                      index === vo.items.length - 1 && { borderBottomWidth: 0 },
                    ]}
                  >
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.productName}</Text>
                      <Text style={styles.itemQty}>
                        Quantity: x{item.quantity}
                      </Text>
                    </View>
                    <Text style={styles.itemPrice}>
                      ${item.totalPrice?.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Address Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>{t('checkout.address')}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.addressText}>
                {orderData?.deliveryAddress}
              </Text>
            </View>
          </View>

          {/* Summary Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Receipt size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Payment Summary</Text>
            </View>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  ${orderData?.subtotal?.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {t('checkout.delivery_fee')}
                </Text>
                <Text style={styles.summaryValue}>
                  ${orderData?.deliveryFee?.toFixed(2)}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={[styles.summaryRow, { marginTop: 8 }]}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>
                  ${orderData?.totalAmount?.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'CREATED':
    case 'PENDING':
      return { color: '#FF9500' };
    case 'CONFIRMED':
    case 'PREPARING':
      return { color: '#5856D6' };
    case 'READY':
    case 'PICKED_UP':
    case 'ON_THE_WAY':
      return { color: theme.colors.primary };
    case 'DELIVERED':
      return { color: theme.colors.success };
    case 'CANCELLED':
      return { color: theme.colors.error };
    default:
      return { color: theme.colors.textMuted };
  }
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
    paddingBottom: 30,
  },
  statusSection: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: 30,
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
    ...theme.shadows.soft,
    marginBottom: theme.spacing.lg,
  },
  reviewProposalsButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.error,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  reviewProposalsText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  statusIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statusText: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  orderIdText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.semibold,
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    marginLeft: 6,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginLeft: 8,
    flex: 1,
  },
  vendorStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  vendorStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  itemsCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.soft,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
    marginBottom: 2,
  },
  itemQty: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
  },
  itemPrice: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  infoCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.soft,
  },
  addressText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.primary,
    lineHeight: 22,
  },
  summaryCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
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
});

export default OrderDetailsScreen;
