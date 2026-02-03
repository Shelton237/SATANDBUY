// config/product-services.js

export const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

export const ENDPOINT = {
  PRODUCT_SERVICE: {
    base: `${BASE_API_URL}/PRODUCT-SERVICE/api`,

    products: {
      base: `/products`,
      list: (params = "") => `/products?${params}`,
      getById: (id) => `/products/${id}`,
      create: () => `/products`,
      update: (id) => `/products/${id}`,
      delete: (id) => `/products/${id}`,
      addVariant: (productId) => `/products/${productId}/variants`,
      updateVariant: (productId, variantId) => `/products/${productId}/variants/${variantId}`,
    },

    categories: {
      base: `/categories`,
      list: (params = "") => `/categories?${params}`,
      getById: (id) => `/categories/${id}`,
      create: () => `/categories`,
      update: (id) => `/categories/${id}`,
      delete: (id) => `/categories/${id}`,
    },

    brands: {
      base: `/brands`,
      list: (params = "") => `/brands?${params}`,
      getById: (id) => `/brands/${id}`,
      create: () => `/brands`,
      update: (id) => `/brands/${id}`,
      delete: (id) => `/brands/${id}`,
    },

    sizes: {
      base: `/sizes`,
      list: (params = "") => `/sizes?${params}`,
      getById: (id) => `/sizes/${id}`,
      create: () => `/sizes`,
      update: (id) => `/sizes/${id}`,
      delete: (id) => `/sizes/${id}`,
    },

    colors: {
      base: `/colors`,
      list: (params = "") => `/colors?${params}`,
      getById: (id) => `/colors/${id}`,
      create: () => `/colors`,
      update: (id) => `/colors/${id}`,
      delete: (id) => `/colors/${id}`,
    },
  },
};
