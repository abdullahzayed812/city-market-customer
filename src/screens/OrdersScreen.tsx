import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, ChevronRight, Clock, Calendar } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrderService } from '../services/api/orderService';
import { useSocket } from '../app/SocketContext';
import { theme } from '../theme';
import { CustomerOrder, CustomerOrderStatus, EventType } from '@city-market/shared'; // Import shared types

const OrdersScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const { data: orders, isLoading } = useQuery<CustomerOrder[] | undefined>({
    // Use CustomerOrder[]
    queryKey: ['myOrders'],
    queryFn: OrderService.getMyOrders,
  });

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
    };

    const events = [
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
    ];

    events.forEach(event => socket.on(event, handleUpdate));

    return () => {
      events.forEach(event => socket.off(event, handleUpdate));
    };
  }, [socket, queryClient]);

  const getStatusConfig = (status: CustomerOrderStatus) => {
    // Use CustomerOrderStatus
    switch (status) {
      case CustomerOrderStatus.PENDING_VENDOR_CONFIRMATION:
      case CustomerOrderStatus.WAITING_CUSTOMER_DECISION:
        return { color: '#FF9500', label: status }; // Yellow/Orange for pending/waiting
      case CustomerOrderStatus.READY:
      case CustomerOrderStatus.IN_DELIVERY:
        return { color: theme.colors.primary, label: status }; // Primary color for in-progress delivery
      case CustomerOrderStatus.COMPLETED:
        return { color: theme.colors.success, label: status }; // Green for completed
      case CustomerOrderStatus.CANCELLED:
        return { color: theme.colors.error, label: status }; // Red for cancelled
      default:
        return { color: theme.colors.textMuted, label: status };
    }
  };

  const renderOrderItem = ({ item }: { item: CustomerOrder }) => {
    // Use CustomerOrder
    const statusConfig = getStatusConfig(item.status);
    const date = new Date(item.createdAt);

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() =>
          navigation.navigate('OrderDetails', { orderId: item.id })
        }
        activeOpacity={0.7}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderIdContainer}>
            <Package size={20} color={theme.colors.primary} />
            <Text style={styles.orderId}>Order #{item.id.slice(-6)}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusConfig.color + '15' },
            ]}
          >
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.orderInfo}>
          <View style={styles.infoItem}>
            <Calendar size={14} color={theme.colors.textMuted} />
            <Text style={styles.infoText}>{date.toLocaleDateString()}</Text>
          </View>
          <View style={styles.infoItem}>
            <Clock size={14} color={theme.colors.textMuted} />
            <Text style={styles.infoText}>
              {date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <View>
            <Text style={styles.totalLabel}>{t('cart.total')}</Text>
            <Text style={styles.totalValue}>
              ${item.totalAmount.toFixed(2)}
            </Text>
          </View>
          <View style={styles.trackButton}>
            <Text style={styles.trackButtonText}>{t('orders.track')}</Text>
            <ChevronRight size={16} color={theme.colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
          <Text style={styles.title}>{t('orders.title')}</Text>
        </View>

        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Package size={64} color={theme.colors.surface} />
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          }
        />
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
    backgroundColor: theme.colors.white,
    ...theme.shadows.soft,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  listContent: { padding: theme.spacing.lg },
  orderCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderId: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  orderInfo: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  infoText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    marginLeft: 6,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  totalValue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondary,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.radius.sm,
    backgroundColor: '#F9FAF3',
  },
  trackButtonText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
});

export default OrdersScreen;
