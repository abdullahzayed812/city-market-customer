import apiClient from './apiClient';
import { ApiResponse, Category, Product, ProductFilter } from '@city-market/shared';

export const CatalogService = {
  getCategories: async () => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/catalog/categories');
    return response.data?.data;
  },
  getProducts: async (filter?: ProductFilter) => { // Updated to accept ProductFilter
    const response = await apiClient.get<ApiResponse<Product[]>>('/catalog/products/search', { params: filter }); // Use search endpoint with filters
    return response.data?.data;
  },
  getProductsByCategory: async (categoryId: string) => {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `/catalog/products/category/${categoryId}`,
    );
    return response.data?.data;
  },
  getProductsByVendor: async (vendorId: string) => {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `/catalog/products/vendor/${vendorId}`,
    );
    return response.data?.data;
  },
  getProductById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Product>>(`/catalog/products/${id}`);
    return response.data?.data;
  },
  searchProducts: async (filter: ProductFilter) => { // Updated to accept ProductFilter
    const response = await apiClient.get<ApiResponse<Product[]>>(`/catalog/products/search`, { params: filter }); // Use ProductFilter
    return response.data?.data;
  },
};
