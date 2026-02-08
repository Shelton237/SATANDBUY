import requests from "./httpServices.js";

const CustomerServices = {
  loginCustomer: async (body) => {
    return requests.post("/customer/login", body);
  },

  verifyEmailAddress: async (body) => {
    return requests.post("/customer/verify-email", body);
  },

  registerCustomer: async (token, body) => {
    return requests.post(`/customer/register/${token}`, body);
  },

  registerCustomerDirect: async (body) => {
    return requests.post("/customer/register", body);
  },

  signUpWithOauthProvider: async (body) => {
    return requests.post(`/customer/signup/oauth`, body);
  },

  signUpWithProvider(token, body) {
    return requests.post(`/customer/signup/${token}`, body);
  },

  forgetPassword: async (body) => {
    return requests.put("/customer/forget-password", body);
  },

  resetPassword: async (body) => {
    return requests.put("/customer/reset-password", body);
  },

  changePassword: async (body) => {
    return requests.post("/customer/change-password", body);
  },

  updateCustomer: async (id, body) => {
    return requests.put(`/customer/${id}`, body);
  },

  getShippingAddress: async ({ userId = "" }) => {
    if (!userId) {
      return Promise.resolve({ shippingAddress: null });
    }
    return requests.get(`/customer/shipping/address/${userId}`);
  },

  addShippingAddress: async ({ userId = "", shippingAddressData }) => {
    if (!userId) {
      return Promise.reject(new Error("User ID is required to save address"));
    }
    return requests.post(
      `/customer/shipping/address/${userId}`,
      shippingAddressData
    );
  },
};

export default CustomerServices;
