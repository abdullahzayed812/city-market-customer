import apiClient from './apiClient';
import { ApiResponse, Vendor } from '@city-market/shared';

export const VendorService = {
  getVendors: async () => {
    const response = await apiClient.get<ApiResponse<Vendor[]>>('/vendors');
    return response.data?.data;
  },
  getOpenVendors: async () => {
    const response = await apiClient.get<ApiResponse<Vendor[]>>('/vendors/open');
    return response.data?.data;
  },
  getVendorById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Vendor>>(`/vendors/${id}`);
    return response.data?.data;
  },
};
