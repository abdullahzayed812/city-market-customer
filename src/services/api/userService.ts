import apiClient from './apiClient';

export const UserService = {
  getProfile: async () => {
    const response = await apiClient.get('/users/customers/me');
    return response.data?.data;
  },
  updateProfile: async (profileData: any) => {
    const response = await apiClient.patch('/users/customers/me', profileData);
    return response.data?.data;
  },
  getAddresses: async () => {
    const response = await apiClient.get('/users/customers/me/addresses');
    return response.data?.data;
  },
  addAddress: async (addressData: any) => {
    const response = await apiClient.post(
      '/users/customers/me/addresses',
      addressData,
    );
    return response.data?.data;
  },
  deleteAddress: async (addressId: string) => {
    const response = await apiClient.delete(`/users/addresses/${addressId}`);
    return response.data?.data;
  },
};
