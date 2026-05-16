import apiClient from './apiClient';
import {
  ApiResponse,
  CreateOrderDto,
  CustomerOrder,
  OrderWithItems,
} from '@city-market/shared';

export const OrderService = {
  createOrder: async (orderData: CreateOrderDto) => {
    const response = await apiClient.post<ApiResponse<OrderWithItems>>(
      '/orders',
      orderData,
    );
    return response.data?.data;
  },
  getDeliveryFee: async (lat: number, lng: number, vendorIds: string[]) => {
    const response = await apiClient.get<ApiResponse<{ deliveryFee: number }>>(
      '/orders/delivery-fee',
      {
        params: { lat, lng, vendorIds: vendorIds.join(',') },
      },
    );
    return response.data?.data?.deliveryFee;
  },
  getMyOrders: async (page: number) => {
    const response = await apiClient.get<
      ApiResponse<{ items: CustomerOrder[]; hasNextPage: boolean }>
    >('/orders/customer-orders', { params: { page, limit: 20 } });
    return response.data.data!;
  },
  getOrderById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<OrderWithItems>>(
      `/orders/customer-orders/${id}`,
    );
    return response.data?.data;
  },
  getOrderProposals: async (id: string) => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/orders/customer-orders/${id}/proposals`,
    );
    return response.data?.data;
  },
  acceptProposal: async (proposalId: string) => {
    const response = await apiClient.post<ApiResponse<null>>(
      `/orders/proposals/${proposalId}/accept`,
    );
    return response.data?.data;
  },
  rejectProposal: async (
    proposalId: string,
    cancelEntireOrder: boolean = false,
  ) => {
    const response = await apiClient.post<ApiResponse<null>>(
      `/orders/proposals/${proposalId}/reject`,
      { cancelEntireOrder },
    );
    return response.data?.data;
  },
};
