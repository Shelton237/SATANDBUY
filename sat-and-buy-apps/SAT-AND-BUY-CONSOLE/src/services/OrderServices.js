import HttpService from "./httpService";

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;
const requests = new HttpService(API_BASE_URL, {
  "Content-Type": "application/json",
});

const OrderServices = {
  getAllOrders: async ({
    body,
    headers,
    customerName,
    status,
    page = 1,
    limit = 8,
    day,
    method,
    startDate,
    endDate,
    driverId,
  }) => {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);

    if (customerName) params.append("customerName", customerName);
    if (status) params.append("status", status);
    if (day) params.append("day", day);
    if (method) params.append("method", method);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (driverId) params.append("driverId", driverId);

    const query = params.toString();
    return requests
      .get(`/orders?${query}`, body, headers)
      .then((res) => res?.data || res);
  },

  getAllOrdersTwo: async ({ invoice, body, headers }) => {
    const searchInvoice = invoice !== null ? invoice : "";
    return requests
      .get(`/orders/all?invoice=${searchInvoice}`, body, headers)
      .then((res) => res?.data || res);
  },

  getRecentOrders: async ({
    page = 1,
    limit = 8,
    startDate = "1:00",
    endDate = "23:59",
  }) => {
    return requests
      .get(
        `/orders/recent?page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}`
      )
      .then((res) => res?.data || res);
  },

  getOrderCustomer: async (id, body) => {
    return requests.get(`/orders/customer/${id}`, body).then((res) => res?.data || res);
  },

  getOrderById: async (id, body) => {
    return requests.get(`/orders/${id}`, body).then((res) => res?.data || res);
  },

  updateOrder: async (id, body, headers) => {
    return requests.put(`/orders/${id}`, body, headers).then((res) => res?.data || res);
  },

  startSorting: async (id, body) => {
    return requests.put(`/orders/${id}/sorting/start`, body);
  },

  completeSorting: async (id, body) => {
    return requests.put(`/orders/${id}/sorting/complete`, body);
  },

  updateSortingItem: async (orderId, itemId, body) => {
    return requests.put(`/orders/${orderId}/sorting/items/${itemId}`, body);
  },

  updateDeliveryPlan: async (id, body) => {
    return requests.put(`/orders/${id}/delivery-plan`, body);
  },

  getOrdersBoard: async ({ limit = 20, statuses = [] } = {}) => {
    const params = new URLSearchParams();
    if (limit) {
      params.append("limit", limit);
    }
    if (Array.isArray(statuses) && statuses.length) {
      params.append("statuses", statuses.join(","));
    }
    const search = params.toString();
    const url = search ? `/orders/board?${search}` : "/orders/board";
    return requests.get(url).then((res) => res?.data || res);
  },

  deleteOrder: async (id) => {
    return requests.delete(`/orders/${id}`).then((res) => res?.data || res);
  },

  getDashboardOrdersData: async ({
    page = 1,
    limit = 8,
    endDate = "23:59",
  }) => {
    return requests
      .get(`/orders/dashboard?page=${page}&limit=${limit}&endDate=${endDate}`)
      .then((res) => res?.data || res);
  },

  getDashboardAmount: async () => {
    return requests.get("/orders/dashboard-amount").then((res) => res?.data || res);
  },

  getDashboardCount: async () => {
    return requests.get("/orders/dashboard-count").then((res) => res?.data || res);
  },

  getDashboardRecentOrder: async ({ page = 1, limit = 8 }) => {
    return requests
      .get(`/orders/dashboard-recent-order?page=${page}&limit=${limit}`)
      .then((res) => res?.data || res);
  },

  getBestSellerProductChart: async () => {
    return requests.get("/orders/best-seller/chart").then((res) => res?.data || res);
  },
};

export default OrderServices;
