import { orderRequests as requests } from "./httpServices";

const OrderServices = {
  addOrder: async (body, headers) => {
    return requests.post("/orders/add", body, headers);
  },

  createPaymentIntent: async (body) => {
    return requests.post("/orders/create-payment-intent", body);
  },

  addRazorpayOrder: async (body) => {
    return requests.post("/orders/add/razorpay", body);
  },

  createOrderByRazorPay: async (body) => {
    return requests.post("/orders/create/razorpay", body);
  },

  getOrderCustomer: async ({ page = 1, limit = 8 }) => {
    return requests.get(`/orders?limit=${limit}&page=${page}`);
  },
  getOrderById: async (id, body) => {
    return requests.get(`/orders/${id}`, body);
  },
  getOrderBoard: async ({ limit = 12 } = {}) => {
    return requests.get(`/orders/board?limit=${limit}`);
  },
  confirmDelivery: async (id) => {
    return requests.put(`/orders/${id}/confirm-delivery`);
  },
};

export default OrderServices;
