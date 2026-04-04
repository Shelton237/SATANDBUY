import { orderRequests as requests } from "./httpServices";

const OrderServices = {
  addOrder: async (body, headers) => {
    return requests.post("/order/add", body, headers);
  },

  createPaymentIntent: async (body) => {
    return requests.post("/order/create-payment-intent", body);
  },

  addRazorpayOrder: async (body) => {
    return requests.post("/order/add/razorpay", body);
  },

  createOrderByRazorPay: async (body) => {
    return requests.post("/order/create/razorpay", body);
  },

  getOrderCustomer: async ({ page = 1, limit = 8 }) => {
    return requests.get(`/order?limit=${limit}&page=${page}`);
  },
  getOrderById: async (id, body) => {
    return requests.get(`/order/${id}`, body);
  },
  getOrderBoard: async ({ limit = 12 } = {}) => {
    return requests.get(`/order/board?limit=${limit}`);
  },
  confirmDelivery: async (id) => {
    return requests.put(`/order/${id}/confirm-delivery`);
  },

  // Commandes reçues pour une boutique (propriétaire)
  getBoutiqueOrders: async ({ boutiqueId, page = 1, limit = 10, status = "" } = {}) => {
    const params = new URLSearchParams({ boutiqueId, page, limit });
    if (status) params.set("status", status);
    return requests.get(`/order/boutique?${params.toString()}`);
  },
};

export default OrderServices;
