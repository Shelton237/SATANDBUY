import { apiHttp as requests } from "./httpClients";
import { withToken } from "@/utils/tokenHelper";

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
    return withToken((token) =>
      requests
        .get(`/orders?${query}`, token, headers)
        .then((res) => res?.data || res)
    );
  },

  getAllOrdersTwo: async ({ invoice, body, headers }) => {
    const searchInvoice = invoice !== null ? invoice : "";
    return withToken((token) =>
      requests
        .get(`/orders/all?invoice=${searchInvoice}`, token, headers)
        .then((res) => res?.data || res)
    );
  },

  getRecentOrders: async ({
    page = 1,
    limit = 8,
    startDate = "1:00",
    endDate = "23:59",
  }) => {
    return withToken((token) =>
      requests
        .get(
          `/orders/recent?page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}`,
          token
        )
        .then((res) => res?.data || res)
    );
  },

  getOrderCustomer: async (id, body) => {
    return withToken((token) =>
      requests.get(`/orders/customer/${id}`, token).then((res) => res?.data || res)
    );
  },

  getOrderById: async (id, body) => {
    return withToken((token) =>
      requests.get(`/orders/${id}`, token).then((res) => res?.data || res)
    );
  },

  updateOrder: async (id, body, headers) => {
    return withToken((token) =>
      requests.put(`/orders/${id}`, body, token, headers).then((res) => res?.data || res)
    );
  },

  startSorting: async (id, body) => {
    return withToken((token) => requests.put(`/orders/${id}/sorting/start`, body, token));
  },

  completeSorting: async (id, body) => {
    return withToken((token) =>
      requests.put(`/orders/${id}/sorting/complete`, body, token)
    );
  },

  updateSortingItem: async (orderId, itemId, body) => {
    return withToken((token) =>
      requests.put(`/orders/${orderId}/sorting/items/${itemId}`, body, token)
    );
  },

  updateDeliveryPlan: async (id, body) => {
    return withToken((token) =>
      requests.put(`/orders/${id}/delivery-plan`, body, token)
    );
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
    return withToken((token) =>
      requests.get(url, token).then((res) => res?.data || res)
    );
  },

  deleteOrder: async (id) => {
    return withToken((token) =>
      requests.delete(`/orders/${id}`, token).then((res) => res?.data || res)
    );
  },

  getDashboardOrdersData: async ({
    page = 1,
    limit = 8,
    endDate = "23:59",
  }) => {
    return withToken((token) =>
      requests
        .get(`/orders/dashboard?page=${page}&limit=${limit}&endDate=${endDate}`, token)
        .then((res) => res?.data || res)
    );
  },

  getDashboardAmount: async () => {
    return withToken((token) =>
      requests.get("/orders/dashboard-amount", token).then((res) => res?.data || res)
    );
  },

  getDashboardCount: async () => {
    return withToken((token) =>
      requests.get("/orders/dashboard-count", token).then((res) => res?.data || res)
    );
  },

  getDashboardRecentOrder: async ({ page = 1, limit = 8 }) => {
    return withToken((token) =>
      requests
        .get(`/orders/dashboard-recent-order?page=${page}&limit=${limit}`, token)
        .then((res) => res?.data || res)
    );
  },

  getBestSellerProductChart: async () => {
    return withToken((token) =>
      requests.get("/orders/best-seller/chart", token).then((res) => res?.data || res)
    );
  },
};

export default OrderServices;
