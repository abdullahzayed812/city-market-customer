import apiClient from './apiClient';
import {
  ApiResponse,
  Category,
  VendorProduct,
  VendorProductFilter,
} from '@city-market/shared';

export const CatalogService = {
  getCategories: async () => {
    const response = await apiClient.get<ApiResponse<Category[]>>(
      '/catalog/categories',
    );
    return response.data?.data;
  },
  getGlobalCategories: async () => {
    const response = await apiClient.get<ApiResponse<Category[]>>(
      '/catalog/categories/global',
    );
    return response.data?.data;
  },
  getVendorCategories: async (vendorId: string) => {
    const response = await apiClient.get<ApiResponse<Category[]>>(
      `/catalog/categories/vendor/${vendorId}`,
    );
    return response.data?.data;
  },
  getVendorProducts: async (filter?: VendorProductFilter) => {
    const response = await apiClient.get<ApiResponse<VendorProduct[]>>(
      '/catalog/products/search',
      { params: filter },
    );
    return response.data?.data;
  },
  getVendorProductsByCategory: async (categoryId: string) => {
    const response = await apiClient.get<ApiResponse<VendorProduct[]>>(
      `/catalog/products/category/${categoryId}`,
    );
    return response.data?.data;
  },
  getVendorProductsByVendor: async (vendorId: string, page: number = 1, limit: number = 20) => {
    const response = await apiClient.get<ApiResponse<{ data: VendorProduct[]; total: number; page: number; limit: number }>>(
      `/catalog/products/vendor/${vendorId}`,
      { params: { page, limit } }
    );
    return response.data?.data;
  },
  getVendorProductById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<VendorProduct>>(
      `/catalog/products/${id}`,
    );
    return response.data?.data;
  },
  searchVendorProducts: async (filter: VendorProductFilter & { page?: number; limit?: number }) => {
    const response = await apiClient.get<ApiResponse<{ data: VendorProduct[]; total: number; page: number; limit: number }>>(
      `/catalog/products/search`,
      { params: filter },
    );
    return response.data?.data;
  },
};
