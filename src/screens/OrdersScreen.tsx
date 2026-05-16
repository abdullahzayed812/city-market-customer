import React, { useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import {
  Package,
  ChevronRight,
  Clock,
  Calendar,
  LogIn,
  UserPlus,
  ShoppingBag,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrderService } from '../services/api/orderService';
import { useSocket } from '../app/SocketContext';
import { useAuth } from '../app/AuthContext';
import { theme } from '../theme';
import {
  CustomerOrder,
  CustomerOrderStatus,
  EventType,
} from '@city-market/shared';
import { useAnimatedPress } from '../hooks/useAnimatedPress';

const STATUS_COLORS: Record<string, string> = {
  [CustomerOrderStatus.PENDING_VENDOR_CONFIRMATION]: '#F59E0B',
  [CustomerOrderStatus.WAITING_CUSTOMER_DECISION]: '#F59E0B',
  [CustomerOrderStatus.READY]: theme.colors.primary,
  [CustomerOrderStatus.IN_DELIVERY]: theme.colors.primary,
  [CustomerOrderStatus.COMPLETED]: '#10B981',
  [CustomerOrderStatus.CANCELLED]: theme.colors.error,
};

const OrderCard = React.memo(({ item, onPress, t }: { item: CustomerOrder; onPress: () => void; t: any }) => {
  const { scaleValue, onPressIn, onPressOut } = useAnimatedPress(0.98);
  const date = new Date(item.createdAt);
  const statusColor = STATUS_COLORS[item.status] ?? theme.colors.textMuted;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={1}
    >
      <Animated.View style={[styles.orderCard, { transform: [{ scale: scaleValue }] }]}>
        <View style={styles.cardHeader}>
          <View style={styles.orderIdRow}>
            <View style={styles.pkgIcon}>
              <Package size={16} color={theme.colors.primary} />
            </View>
            <Text style={styles.orderId}>#{item.id.slice(-6).toUpperCase()}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: statusColor + '18' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {t(`orders.status_${item.status.toLowerCase()}`)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.dateRow}>
          <View style={styles.dateItem}>
            <Calendar size={13} color={theme.colors.textMuted} />
            <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
          </View>
          <View style={styles.dateItem}>
            <Clock size={13} color={theme.colors.textMuted} />
            <Text style={styles.dateText}>
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.totalLabel}>{t('cart.total')}</Text>
            <Text style={styles.totalValue}>${item.totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.trackBtn}>
            <Text style={styles.trackText}>{t('orders.track')}</Text>
            <ChevronRight size={15} color={theme.colors.primary} />
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
});

const GuestView = ({ navigation, t }: { navigation: any; t: any }) => {
  const { scaleValue: ls, onPressIn: li, onPressOut: lo } = useAnimatedPress(0.96);
  const { scaleValue: rs, onPressIn: ri, onPressOut: ro } = useAnimatedPress(0.96);

  return (
    <View style={styles.guestContainer}>
      <View style={styles.guestIconCircle}>
        <ShoppingBag size={36} color={theme.colors.primary} />
      </View>
      <Text style={styles.guestTitle}>{t('auth.login_required_title') || 'Login Required'}</Text>
      <Text style={styles.guestMessage}>
        {t('auth.login_to_view_orders') || 'Login to view and track your orders'}
      </Text>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} onPressIn={li} onPressOut={lo} activeOpacity={1} style={{ width: '100%', marginBottom: theme.spacing.sm }}>
        <Animated.View style={[styles.guestLoginBtn, { transform: [{ scale: ls }] }]}>
          <LogIn size={18} color={theme.colors.white} />
          <Text style={styles.guestLoginBtnText}>{t('common.login') || 'Login'}</Text>
        </Animated.View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')} onPressIn={ri} onPressOut={ro} activeOpacity={1} style={{ width: '100%' }}>
        <Animated.View style={[styles.guestRegBtn, { transform: [{ scale: rs }] }]}>
          <UserPlus size={18} color={theme.colors.primary} />
          <Text style={styles.guestRegBtnText}>{t('common.register') || 'Register'}</Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const OrdersScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const { data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['myOrders'],
      queryFn: ({ pageParam }) => OrderService.getMyOrders(pageParam),
      initialPageParam: 1,
      getNextPageParam: (lastPage, _allPages, lastPageParam) =>
        lastPage.hasNextPage ? lastPageParam + 1 : undefined,
    });

  const orders = data?.pages.flatMap(p => p.items ?? []) ?? [];

  const handleUpdate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['myOrders'] });
  }, [queryClient]);

  const socketEvents = useMemo(() => [
    EventType.ORDER_AWAITING_CUSTOMER_CONFIRMATION,
    EventType.VENDOR_ORDER_PROPOSED,
    EventType.ORDER_CREATED,
    EventType.ORDER_PREPARING,
    EventType.ORDER_CONFIRMED,
    EventType.ORDER_CANCELLED,
    EventType.ORDER_READY,
    EventType.ORDER_PICKED_UP,
    EventType.ORDER_ON_THE_WAY,
    EventType.ORDER_DELIVERED,
    EventType.PROPOSAL_ACCEPTED,
    EventType.PROPOSAL_REJECTED,
  ], []);

  useEffect(() => {
    if (!socket) return;
    socketEvents.forEach(event => socket.on(event, handleUpdate));
    return () => { socketEvents.forEach(event => socket.off(event, handleUpdate)); };
  }, [socket, handleUpdate, socketEvents]);

  const renderOrderItem = useCallback(
    ({ item }: { item: CustomerOrder }) => (
      <OrderCard
        item={item}
        onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
        t={t}
      />
    ),
    [navigation, t],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('orders.title')}</Text>
        </View>

        {!isAuthenticated ? (
          <GuestView navigation={navigation} t={t} />
        ) : isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
            }
            onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator style={styles.footerLoader} color={theme.colors.primary} />
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Package size={40} color={theme.colors.primary} strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyTitle}>{t('orders.no_orders')}</Text>
                <Text style={styles.emptyHint}>
                  {t('orders.no_orders_hint') || 'Your order history will appear here'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.white },
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.4,
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.soft,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pkgIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.colors.primaryXLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primaryXLight,
  },
  trackText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  footerLoader: { paddingVertical: 20 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.primaryXLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  guestIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.primaryXLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  guestMessage: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.xl,
  },
  guestLoginBtn: {
    height: 52,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...theme.shadows.soft,
  },
  guestLoginBtnText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  guestRegBtn: {
    height: 52,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  guestRegBtnText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default OrdersScreen;
