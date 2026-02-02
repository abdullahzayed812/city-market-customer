import apiClient from './apiClient';

export const VendorService = {
  getVendors: async () => {
    const response = await apiClient.get('/vendors');
    return response.data?.data;
  },
  getOpenVendors: async () => {
    const response = await apiClient.get('/vendors/open');
    return response.data?.data;
  },
  getVendorById: async (id: string) => {
    const response = await apiClient.get(`/vendors/${id}`);
    return response.data?.data;
  },
};
