import HttpService from "@/services/httpService";
import { withToken } from "@/utils/tokenHelper";

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

const http = new HttpService(API_BASE_URL, {
  "Content-Type": "application/json",
});

const mapProduct = (product = {}) => ({
  ...product,
  id: product._id,
  status: product.status || "show",
  type: product.type || "physical",
  serviceDetails: product.serviceDetails || null,
  approvalStatus: product.approvalStatus || "approved",
});

const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "All") {
      query.append(key, value);
    }
  });
  return query.toString();
};

const ProductServices = {
  getAll: ({
    page = 1,
    limit = 20,
    category,
    title,
    price,
    owner,
  } = {}) =>
    withToken(async (token) => {
      const queryString = buildQueryString({
        page,
        limit,
        category,
        title,
        price,
        owner,
      });

      const response = await http.get(
        queryString ? `/products?${queryString}` : "/products",
        token
      );

      const payload = response?.data || {};
      const products = Array.isArray(payload.products)
        ? payload.products.map(mapProduct)
        : [];

      return {
        products,
        totalDoc: payload.totalDoc ?? products.length,
        limits: payload.limits ?? limit,
        pages: payload.pages ?? page,
      };
    }),

  getProductById: (id) =>
    withToken(async (token) => {
      if (!id) throw new Error("Product id is required");
      const response = await http.get(`/products/${id}`, token);
      return mapProduct(response?.data || {});
    }),

  addProduct: (data) =>
    withToken(async (token) => {
      const response = await http.post("/products/add", data, token);
      return mapProduct(response?.data);
    }),

  updateProduct: (id, data) =>
    withToken(async (token) => {
      const response = await http.patch(`/products/${id}`, data, token);
      return response?.data || {};
    }),

  updateStatus: (id, body) =>
    withToken(async (token) => {
      const response = await http.put(`/products/status/${id}`, body, token);
      return response?.data || {};
    }),

  updateApprovalStatus: (id, body) =>
    withToken(async (token) => {
      const response = await http.put(
        `/products/approval/${id}`,
        body,
        token
      );
      return response?.data || {};
    }),

  deleteProduct: (id) =>
    withToken(async (token) => {
      const response = await http.delete(`/products/${id}`, token);
      return response?.data || {};
    }),

  deleteManyProducts: (body) =>
    withToken(async (token) => {
      const response = await http.patch(`/products/delete/many`, body, token);
      return response?.data || {};
    }),

  addAllProducts: (body) =>
    withToken(async (token) => {
      const response = await http.post(`/products/all`, body, token);
      return response?.data || {};
    }),

  updateManyProducts: (body) =>
    withToken(async (token) => {
      const response = await http.patch(`/products/update/many`, body, token);
      return response?.data || {};
    }),
};

export default ProductServices;
