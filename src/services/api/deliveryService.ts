import apiClient from './apiClient';
import { ApiResponse, DeliveryStatus } from '@city-market/shared';

export interface OrderCourier {
  deliveryId: string;
  status: DeliveryStatus;
  fulfillmentType: 'OFFICE' | 'FREELANCE' | null;
  pickupCount: number;
  // Set from assignment on; phone is empty once delivered
  courier: {
    name: string;
    phone: string;
    vehicleType: string | null;
    licensePlate: string | null;
  } | null;
  // Office that handled it; null for a freelance courier
  officeName: string | null;
  myRating: { stars: number; comment: string | null } | null;
  canRate: boolean;
}

export const DeliveryService = {
  getOrderCouriers: async (orderId: string) => {
    const response = await apiClient.get<ApiResponse<OrderCourier[]>>(
      `/delivery/deliveries/by-order/${orderId}/couriers`,
    );
    return response.data?.data ?? [];
  },
  rateDelivery: async (deliveryId: string, stars: number, comment?: string) => {
    const response = await apiClient.post<ApiResponse<null>>(
      `/delivery/deliveries/${deliveryId}/rating`,
      { stars, comment },
    );
    return response.data;
  },
};
