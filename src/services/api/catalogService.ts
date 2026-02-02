import apiClient from './apiClient';

export const CatalogService = {
  getCategories: async () => {
    const response = await apiClient.get('/catalog/categories');
    return response.data?.data;
  },
  getProducts: async () => {
    const response = await apiClient.get('/catalog/products');
    return response.data?.data;
  },
  getProductsByCategory: async (categoryId: string) => {
    const response = await apiClient.get(
      `/catalog/products/category/${categoryId}`,
    );
    return response.data?.data;
  },
  getProductsByVendor: async (vendorId: string) => {
    const response = await apiClient.get(
      `/catalog/products/vendor/${vendorId}`,
    );
    return response.data?.data;
  },
  getProductById: async (id: string) => {
    const response = await apiClient.get(`/catalog/products/${id}`);
    return response.data?.data;
  },
  searchProducts: async (query: string) => {
    const response = await apiClient.get(`/catalog/products/search?q=${query}`);
    return response.data?.data;
  },
};
