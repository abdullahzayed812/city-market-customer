import apiClient from './apiClient';
import {
  ApiResponse,
  Category,
  Product,
  ProductFilter,
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
  getProducts: async (filter?: ProductFilter) => {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      '/catalog/products/search',
      { params: filter },
    );
    return response.data?.data;
  },
  getProductsByCategory: async (categoryId: string) => {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `/catalog/products/category/${categoryId}`,
    );
    return response.data?.data;
  },
  getProductsByVendor: async (vendorId: string) => {
    const response = await apiClient.get<ApiResponse<{ data: Product[] }>>(
      `/catalog/products/vendor/${vendorId}`,
    );
    return response.data?.data;
  },
  getProductById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Product>>(
      `/catalog/products/${id}`,
    );
    return response.data?.data;
  },
  searchProducts: async (filter: ProductFilter) => {
    const response = await apiClient.get<ApiResponse<{ data: Product[] }>>(
      `/catalog/products/search`,
      { params: filter },
    );
    return response.data?.data;
  },
};
