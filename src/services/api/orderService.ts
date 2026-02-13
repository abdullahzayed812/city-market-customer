import apiClient from './apiClient';

export const OrderService = {
  createOrder: async (orderData: any) => {
    const response = await apiClient.post('/orders', orderData);
    return response.data?.data;
  },
  getMyOrders: async () => {
    const response = await apiClient.get('/orders/customer/me');
    return response.data?.data;
  },
  getOrderById: async (id: string) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data?.data;
  },
  cancelOrder: async (id: string) => {
    const response = await apiClient.post(`/orders/${id}/cancel`);
    return response.data?.data;
  },
  acceptProposal: async (proposalId: string) => {
    const response = await apiClient.post(`/orders/proposals/${proposalId}/accept`);
    return response.data?.data;
  },
  rejectProposal: async (proposalId: string, cancelEntireOrder: boolean = false) => {
    const response = await apiClient.post(`/orders/proposals/${proposalId}/reject`, { cancelEntireOrder });
    return response.data?.data;
  },
};
