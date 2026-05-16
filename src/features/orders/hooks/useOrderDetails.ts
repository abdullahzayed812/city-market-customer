import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../../../app/SocketContext';
import { OrderService } from '../../../services/api/orderService';
import { theme } from '../../../theme';
import {
  OrderWithItems,
  CustomerOrderStatus,
  VendorOrderStatus,
  EventType,
} from '@city-market/shared';

export const useOrderDetails = (orderId: string) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedVendorForRating, setSelectedVendorForRating] =
    useState<any>(null);

  const {
    data: order,
    isLoading,
    refetch: refetchOrder,
    isRefetching: isRefetchingOrder,
  } = useQuery<OrderWithItems | undefined>({
    queryKey: ['order', orderId],
    queryFn: () => OrderService.getOrderById(orderId),
  });

  const {
    data: fetchedProposals = [],
    isLoading: isLoadingProposals,
    refetch: refetchProposals,
    isRefetching: isRefetchingProposals,
  } = useQuery({
    queryKey: ['order-proposals', orderId],
    queryFn: () => OrderService.getOrderProposals(orderId),
  });

  const refetch = useCallback(() => {
    refetchOrder();
    refetchProposals();
  }, [refetchOrder, refetchProposals]);

  const handleUpdate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    queryClient.invalidateQueries({ queryKey: ['order-proposals', orderId] });
  }, [queryClient, orderId]);

  const socketEvents = useMemo(
    () => [
      // EventType.ORDER_AWAITING_CUSTOMER_CONFIRMATION,
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
        case CustomerOrderStatus.DRAFT:
        case VendorOrderStatus.DRAFT:
          return { color: theme.colors.textMuted };
        case CustomerOrderStatus.AWAITING_CUSTOMER_CONFIRMATION:
        case CustomerOrderStatus.PENDING_VENDOR_CONFIRMATION:
        case CustomerOrderStatus.WAITING_CUSTOMER_DECISION:
        case VendorOrderStatus.PENDING:
        case VendorOrderStatus.PROPOSAL_SENT:
          return { color: '#FF9500' };
        case CustomerOrderStatus.PREPARING:
        case CustomerOrderStatus.READY:
        case CustomerOrderStatus.PICKED_UP:
        case CustomerOrderStatus.IN_DELIVERY:
        case VendorOrderStatus.PREPARING:
        case VendorOrderStatus.CONFIRMED:
        case VendorOrderStatus.PICKED_UP:
        case VendorOrderStatus.ON_THE_WAY:
          return { color: theme.colors.primary };
        case CustomerOrderStatus.COMPLETED:
        case VendorOrderStatus.DELIVERED:
          return { color: theme.colors.success };
        case CustomerOrderStatus.CANCELLED:
        case CustomerOrderStatus.CANCELLED_BY_CUSTOMER:
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

  const handleRateVendor = (vendor: any) => {
    setSelectedVendorForRating(vendor);
    setRatingModalVisible(true);
  };

  return {
    orderData,
    vendorOrders,
    statusConfig,
    date,
    isLoading: isLoading || isLoadingProposals,
    refetch,
    isRefetching: isRefetchingOrder || isRefetchingProposals,
    fetchedProposals,
    ratingModalVisible,
    setRatingModalVisible,
    selectedVendorForRating,
    handleRateVendor,
    getStatusConfig,
    t,
  };
};
