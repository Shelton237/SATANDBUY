import HttpService from "./httpService";

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;
const requests = new HttpService(API_BASE_URL, {
  "Content-Type": "application/json",
});

const CustomerServices = {
  getAllCustomers: async ({ searchText = "" }) => {
    return requests.get(`/customer?searchText=${searchText}`);
  },

  addAllCustomers: async (body) => {
    return requests.post("/customer/add/all", body);
  },
  // user create
  createCustomer: async (body) => {
    return requests.post(`/customer/create`, body);
  },

  filterCustomer: async (email) => {
    return requests.post(`/customer/filter/${email}`);
  },

  getCustomerById: async (id) => {
    return requests.get(`/customer/${id}`);
  },

  updateCustomer: async (id, body) => {
    return requests.put(`/customer/${id}`, body);
  },

  deleteCustomer: async (id) => {
    return requests.delete(`/customer/${id}`);
  },
};

export default CustomerServices;
