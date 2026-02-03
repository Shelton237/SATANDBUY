import HttpService from "@/services/httpService";
import { withToken } from "@/utils/tokenHelper";
import { ENDPOINT } from "@/config/product-services";

const { PRODUCT_SERVICE } = ENDPOINT;
const { products } = PRODUCT_SERVICE;

const httpService = new HttpService(PRODUCT_SERVICE.base);

const ProductServices = {
  getAll: ({ page = 0, size = 20, sortBy = "name", sortDir = "ASC" } = {}) =>
    withToken(async (token) => {
      const params = new URLSearchParams({ page, size, sortBy, sortDir }).toString();
      const response = await httpService.get(products.list(params), token);

      const data = response?.data?.data || {};

      return {
        data: Array.isArray(data.content) ? data.content : [],
        pagination: {
          totalElements: data.totalElements ?? 0,
          totalPages: data.totalPages ?? 0,
          size: data.size ?? size,
          number: data.number ?? page,
          last: data.last ?? true,
          first: data.first ?? true,
        },
      };
    }),

  getAllRaw: ({ page = 0, size = 1000, sortBy = "name", sortDir = "ASC" } = {}) =>
    withToken(async (token) => {
      const params = new URLSearchParams({ page, size, sortBy, sortDir }).toString();
      const response = await httpService.get(products.list(params), token);
      return response.data;
    }),

  getById: (id) =>
    withToken(async (token) => {
      try {
        const response = await httpService.get(products.getById(id), token);
        return response.data;
      } catch (error) {
        console.error("Erreur lors du fetch du produit :", error);
        throw error;
      }
    }),

  addOne: (data) =>
    withToken(async (token) => {
      const response = await httpService.post(products.create(), data, token);
      return response.data;
    }),

  updateOne: (id, data) =>
    withToken(async (token) => {
      const response = await httpService.put(products.update(id), data, token);
      return response.data;
    }),

  deleteOne: (id) =>
    withToken(async (token) => {
      const response = await httpService.delete(products.delete(id), token);
      return response.data;
    }),

  addVariant: (productId, variantData) =>
    withToken(async (token) => {
      const response = await httpService.post(products.addVariant(productId), variantData, token);
      return response.data;
    }),

  updateVariant: (productId, variantId, variantData) =>
    withToken(async (token) => {
      const response = await httpService.put(products.updateVariant(productId, variantId), variantData, token);
      return response.data;
    }),

  deleteVariant: (productId, variantId) =>
    withToken(async (token) => {
      // Note: Vous devrez peut-être ajouter une route deleteVariant dans votre configuration ENDPOINT
      const response = await httpService.delete(`/products/${productId}/variants/${variantId}`, token);
      return response.data;
    }),
};

export default ProductServices;