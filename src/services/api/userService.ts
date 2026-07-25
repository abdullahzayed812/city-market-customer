import apiClient from './apiClient';
import { ApiResponse, Customer, UpdateCustomerDto, Address, CreateAddressDto, RegisterDeviceDto } from '@city-market/shared';

export const UserService = {
  // Public — safe to call before the auth account exists (used as a pre-check on
  // registration so we don't create an orphaned auth account for a phone that's
  // already taken).
  checkPhoneAvailable: async (phone: string): Promise<boolean> => {
    const response = await apiClient.get<ApiResponse<{ available: boolean }>>('/users/customers/check-phone', {
      params: { phone },
    });
    return !!response.data?.data?.available;
  },
  createCustomer: async (dto: { fullName: string; phone: string }) => {
    const response = await apiClient.post<ApiResponse<Customer>>('/users/customers', dto);
    return response.data?.data;
  },
  getProfile: async () => {
    const response = await apiClient.get<ApiResponse<Customer>>('/users/customers/me');
    return response.data?.data;
  },
  registerDevice: async (dto: RegisterDeviceDto) => {
    const response = await apiClient.patch<ApiResponse<null>>('/users/customers/me/device', dto);
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
