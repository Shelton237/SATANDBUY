import HttpService from "@/services/httpService";
import { withToken } from "@/utils/tokenHelper";
import { ENDPOINT } from "@/config/product-services";

const { PRODUCT_SERVICE } = ENDPOINT;
const { categories } = PRODUCT_SERVICE;

const httpService = new HttpService(PRODUCT_SERVICE.base);

const CategoryServices = {
  getAll: ({ page = 0, size = 20, sortBy = "name", sortDir = "ASC" } = {}) =>
    withToken(async (token) => {
      const params = new URLSearchParams({ page, size, sortBy, sortDir }).toString();
      const response = await httpService.get(categories.list(params), token);

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
      const response = await httpService.get(categories.list(params), token);
      return response.data;
    }),

  getById: (id) =>
    withToken(async (token) => {
      try {
        const response = await httpService.get(categories.getById(id), token);
        return response.data;
      } catch (error) {
        console.error("Erreur lors du fetch de la catégorie :", error);
        throw error;
      }
    }),

  addOne: (data) =>
    withToken(async (token) => {
      const response = await httpService.post(categories.create(), data, token);
      return response.data;
    }),

  updateOne: (id, data) =>
    withToken(async (token) => {
      const response = await httpService.put(categories.update(id), data, token);
      return response.data;
    }),

  deleteOne: (id) =>
    withToken(async (token) => {
      const response = await httpService.delete(categories.delete(id), token);
      return response.data;
    }),
};

export default CategoryServices;