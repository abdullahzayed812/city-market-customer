import React, { useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Pressable, StatusBar, RefreshControl } from 'react-native';
import {
  AppText as Text,
  Button,
  ScreenHeader,
  StatusBadge,
  EmptyState,
  LoadingState,
  ForwardIcon,
  shortId,
  palette,
  radii,
  space,
} from '@city-market/mobile-ui';
import { useTranslation } from 'react-i18next';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Package, LogIn, UserPlus, ShoppingBag, Timer } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrderService } from '../services/api/orderService';
import { useSocket } from '../app/SocketContext';
import { useAuth } from '../app/AuthContext';
import { CustomerOrder, CustomerOrderStatus, EventType } from '@city-market/shared';
import { useSlaCountdown } from '../hooks/useSlaCountdown';
import { useFormat } from '../hooks/useFormat';
import { orderStatusMeta } from '../features/orders/orderStatus';
import QueryError from '../components/common/QueryError';

const OrderCard = React.memo(({ item, onPress, t }: { item: CustomerOrder; onPress: () => void; t: any }) => {
  const { money } = useFormat();
  const date = new Date(item.createdAt);
  const status = orderStatusMeta(item.status);
  const isWaiting = item.status === CustomerOrderStatus.WAITING_CUSTOMER_DECISION;
  const countdown = useSlaCountdown(isWaiting ? (item as any).customerDecisionDeadline : null);
  const showCountdown = isWaiting && countdown.remainingSeconds > 0 && !countdown.isExpired;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.orderCard, isWaiting && styles.orderCardUrgent, pressed && styles.pressed]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.flex}>
          <Text variant="subheading" color={palette.text}>{shortId(item.id)}</Text>
          <Text variant="caption" color={palette.textMuted}>
            {date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
          </Text>
        </View>
        <StatusBadge label={t(`orders.status_${item.status.toLowerCase()}`)} tone={status.tone} icon={status.icon} size="sm" />
      </View>

      {showCountdown ? (
        <View style={[styles.countdownRow, countdown.isWarning && styles.countdownUrgent]}>
          <Timer size={15} color={countdown.isWarning ? palette.error : palette.warning} />
          <Text variant="caption" color={countdown.isWarning ? palette.error : palette.warning}>
            {t('orders.decide_before', 'Decide before')}: {countdown.formattedTime}
          </Text>
        </View>
      ) : null}

      <View style={styles.cardFooter}>
        <View style={styles.flex}>
          <Text variant="caption" color={palette.textMuted}>{t('cart.total')}</Text>
          <Text variant="heading" color={palette.text} style={styles.tabular}>{money(item.totalAmount)}</Text>
        </View>
        <View style={styles.trackBtn}>
          <Text variant="label" color={palette.primary}>{t('orders.track')}</Text>
          <ForwardIcon size={16} color={palette.primary} />
        </View>
      </View>
    </Pressable>
  );
});

const GuestView = ({ navigation, t }: { navigation: any; t: any }) => (
  <View style={styles.guestContainer}>
    <EmptyState icon={ShoppingBag} title={t('auth.login_required_title')} message={t('auth.login_to_view_orders')} compact />
    <Button label={t('common.login')} icon={LogIn} size="lg" fullWidth onPress={() => navigation.navigate('Login')} />
    <Button
      label={t('common.register')}
      icon={UserPlus}
      size="lg"
      variant="outline"
      fullWidth
      onPress={() => navigation.navigate('Register')}
      style={styles.guestSecond}
    />
  </View>
);

const OrdersScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const { data, isLoading, error, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.surface} />
      <ScreenHeader title={t('orders.title')} />

      {!isAuthenticated ? (
        <GuestView navigation={navigation} t={t} />
      ) : isLoading ? (
        <LoadingState />
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={Separator}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={palette.primary} colors={[palette.primary]} />
          }
          onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator style={styles.footerLoader} color={palette.primary} /> : null
          }
          ListEmptyComponent={
            error ? (
              <QueryError error={error} onRetry={refetch} retrying={isRefetching} />
            ) : (
              <EmptyState
                icon={Package}
                title={t('orders.no_orders')}
                message={t('orders.no_orders_hint')}
                actionLabel={t('cart.browse_stores')}
                onAction={() => navigation.navigate('Home')}
              />
            )
          }
        />
      )}
    </SafeAreaView>
  );
};

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  listContent: {
    flexGrow: 1,
    padding: space.lg,
    paddingBottom: space.huge,
  },
  separator: {
    height: space.md,
  },
  flex: {
    flex: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  orderCard: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: space.lg,
    gap: space.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.borderStrong,
  },
  orderCardUrgent: {
    borderWidth: 1.5,
    borderColor: palette.warning,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radii.sm,
    backgroundColor: palette.warningSoft,
  },
  countdownUrgent: {
    backgroundColor: palette.errorSoft,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minHeight: 32,
  },
  footerLoader: {
    paddingVertical: space.xl,
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: space.xxl,
  },
  guestSecond: {
    marginTop: space.md,
  },
});

export default OrdersScreen;
