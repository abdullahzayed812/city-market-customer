import apiClient from './apiClient';
import { ApiResponse, Customer, UpdateCustomerDto, Address, CreateAddressDto } from '@city-market/shared';

export const UserService = {
  getProfile: async () => {
    const response = await apiClient.get<ApiResponse<Customer>>('/users/customers/me');
    return response.data?.data;
  },
  updateProfile: async (profileData: UpdateCustomerDto) => {
    const response = await apiClient.patch<ApiResponse<null>>('/users/customers/me', profileData);
    return response.data?.data;
  },
  getAddresses: async () => {
    const response = await apiClient.get<ApiResponse<Address[]>>('/users/customers/me/addresses');
    return response.data?.data;
  },
  addAddress: async (addressData: CreateAddressDto) => {
    const response = await apiClient.post<ApiResponse<Address>>(
      '/users/customers/me/addresses',
      addressData,
    );
    return response.data?.data;
  },
  deleteAddress: async (addressId: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(`/users/addresses/${addressId}`);
    return response.data?.data;
  },
};
