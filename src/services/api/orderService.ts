import apiClient from './apiClient';
import {
  ApiResponse,
  CreateOrderDto,
  CustomerOrder,
  OrderWithItems,
  CustomerOrderStatus,
} from '@city-market/shared';

export const OrderService = {
  createOrder: async (orderData: CreateOrderDto) => {
    const response = await apiClient.post<ApiResponse<OrderWithItems>>(
      '/orders',
      orderData,
    );
    return response.data?.data;
  },
  getMyOrders: async () => {
    const response = await apiClient.get<ApiResponse<CustomerOrder[]>>(
      '/orders/customer-orders',
    ); // Corrected endpoint
    return response.data?.data;
  },
  getOrderById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<OrderWithItems>>(
      `/orders/customer-orders/${id}`,
    );
    return response.data?.data;
  },
  cancelOrder: async (id: string) => {
    // Corrected to use PUT /orders/:id/status with CustomerOrderStatus.CANCELLED
    const response = await apiClient.put<ApiResponse<null>>(
      `/orders/${id}/status`,
      { status: CustomerOrderStatus.CANCELLED },
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
