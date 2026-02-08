import HttpService from "@/services/httpService";
import { withToken } from "@/utils/tokenHelper";

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

const http = new HttpService(API_BASE_URL, {
  "Content-Type": "application/json",
});

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });
  const str = query.toString();
  return str ? `?${str}` : "";
};

const resolveName = (name) => {
  if (!name) return "";
  if (typeof name === "string") return name;
  if (typeof name === "object") {
    return name.fr || name.en || Object.values(name)[0] || "";
  }
  return "";
};

const mapUser = (entry) => {
  if (!entry) return null;
  if (typeof entry === "string") {
    return { id: entry, name: entry, email: "", role: "" };
  }
  return {
    id: entry._id || entry.id || entry,
    name: resolveName(entry.name) || entry.email || "",
    email: entry.email || "",
    role: entry.role || "",
  };
};

const mapRate = (rate = {}) => ({
  ...rate,
  id: rate._id || rate.id,
  cost: Number(rate.cost || 0),
  approvalStatus: rate.approvalStatus || "pending",
  createdBy: mapUser(rate.createdBy),
  approvedBy: mapUser(rate.approvedBy),
});

const ShippingRateServices = {
  getAll: (params = {}) =>
    withToken(async (token) => {
      const query = buildQuery(params);
      const response = await http.get(`/shipping-rate${query}`, token);
      const payload = response?.data || response || [];
      return Array.isArray(payload) ? payload.map(mapRate) : [];
    }),

  add: (data = {}) =>
    withToken(async (token) => {
      const response = await http.post("/shipping-rate", data, token);
      return mapRate(response?.data || response);
    }),

  update: (id, data = {}) =>
    withToken(async (token) => {
      const response = await http.put(`/shipping-rate/${id}`, data, token);
      return mapRate(response?.data || response);
    }),

  remove: (id) =>
    withToken(async (token) => {
      const response = await http.delete(`/shipping-rate/${id}`, token);
      return response?.data || response;
    }),
};

export default ShippingRateServices;
