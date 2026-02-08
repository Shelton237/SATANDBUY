import HttpService from "@/services/httpService";
import { withToken } from "@/utils/tokenHelper";

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

const http = new HttpService(API_BASE_URL, {
  "Content-Type": "application/json",
});

const STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};

const normalizeStatus = (status) => {
  const normalized = status?.toString().toLowerCase();
  if (normalized === "show" || normalized === "active") return STATUS.ACTIVE;
  return STATUS.INACTIVE;
};

const toApiStatus = (status) => {
  if (!status) return "show";
  const normalized = status.toString().toLowerCase();
  return normalized === "inactive" || normalized === "hide" ? "hide" : "show";
};

const mapCategory = (category = {}) => ({
  ...category,
  id: category._id?.toString() || category.id,
  status: normalizeStatus(category.status),
  rawStatus: category.status,
  parentId: category.parentId || null,
  children: Array.isArray(category.children)
    ? category.children.map(mapCategory)
    : [],
});

const mapFlatCategory = (category = {}) => ({
  ...category,
  id: category._id?.toString() || category.id,
  status: normalizeStatus(category.status),
  rawStatus: category.status,
});

const buildPagination = (items = [], page = 1, limit = 20) => {
  const totalElements = items.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / limit));
  return {
    totalElements,
    totalPages,
    size: limit,
    number: page,
    last: page >= totalPages,
    first: page <= 1,
  };
};

const CategoryServices = {
  getAll: ({ page = 1, limit = 20 } = {}) =>
    withToken(async (token) => {
      const response = await http.get("/category", token);
      const categories = Array.isArray(response?.data)
        ? response.data.map(mapCategory)
        : [];

      return {
        data: categories,
        pagination: buildPagination(categories, page, limit),
      };
    }),

  getAllCategory: () =>
    withToken(async (token) => {
      const response = await http.get("/category", token);
      const categories = Array.isArray(response?.data)
        ? response.data.map(mapCategory)
        : [];
      return categories;
    }),

  getAllCategories: () =>
    withToken(async (token) => {
      const response = await http.get("/category/all", token);
      const categories = Array.isArray(response?.data)
        ? response.data.map(mapFlatCategory)
        : [];
      return categories;
    }),

  getAllRaw: () =>
    withToken(async (token) => {
      const response = await http.get("/category/all", token);
      const categories = Array.isArray(response?.data)
        ? response.data.map(mapFlatCategory)
        : [];
      return categories;
    }),

  getById: (id) =>
    withToken(async (token) => {
      const response = await http.get(`/category/${id}`, token);
      return mapFlatCategory(response?.data || {});
    }),

  addOne: (data = {}) =>
    withToken(async (token) => {
      const payload = {
        ...data,
        status: toApiStatus(data?.status),
      };
      const response = await http.post("/category/add", payload, token);
      return response?.data;
    }),

  addAllCategory: (records = []) =>
    withToken(async (token) => {
      const payload = records.map((record) => ({
        ...record,
        status: toApiStatus(record?.status),
      }));
      const response = await http.post("/category/add/all", payload, token);
      return response?.data;
    }),

  updateOne: (id, data = {}) =>
    withToken(async (token) => {
      const payload = {
        ...data,
        status: data?.status ? toApiStatus(data.status) : undefined,
      };
      const response = await http.put(`/category/${id}`, payload, token);
      return response?.data;
    }),

  updateStatus: (id, body = {}) =>
    withToken(async (token) => {
      const payload = {
        status: toApiStatus(body?.status),
      };
      const response = await http.put(`/category/status/${id}`, payload, token);
      return response?.data;
    }),

  updateManyCategory: (payload = {}) =>
    withToken(async (token) => {
      const normalizedPayload = {
        ...payload,
        status: payload?.status ? toApiStatus(payload.status) : undefined,
      };
      const response = await http.patch(
        "/category/update/many",
        normalizedPayload,
        token
      );
      return response?.data;
    }),

  deleteOne: (id) =>
    withToken(async (token) => {
      const response = await http.delete(`/category/${id}`, token);
      return response?.data;
    }),

  deleteCategory: (id) =>
    withToken(async (token) => {
      const response = await http.delete(`/category/${id}`, token);
      return response?.data;
    }),

  deleteManyCategory: (payload = {}) =>
    withToken(async (token) => {
      const response = await http.patch(
        "/category/delete/many",
        payload,
        token
      );
      return response?.data;
    }),
};

export default CategoryServices;
