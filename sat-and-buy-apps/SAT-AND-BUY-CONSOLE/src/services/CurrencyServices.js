import HttpService from "./httpService";
import { withToken } from "@/utils/tokenHelper";

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;
const requests = new HttpService(API_BASE_URL, {
  "Content-Type": "application/json",
});

const CurrencyServices = {
  getAllCurrency: () =>
    withToken(async (token) => {
      const response = await requests.get("/currency", token);
      return response?.data || [];
    }),

  getShowingCurrency: () =>
    withToken(async (token) => {
      const response = await requests.get("/currency/show", token);
      return response?.data || [];
    }),

  getCurrencyById: (id) =>
    withToken(async (token) => {
      const response = await requests.get(`/currency/${id}`, token);
      return response?.data;
    }),

  addCurrency: (body) =>
    withToken(async (token) => {
      const response = await requests.post("/currency/add", body, token);
      return response?.data;
    }),

  addAllCurrency: (body) =>
    withToken(async (token) => {
      const response = await requests.post("/currency/add/all", body, token);
      return response?.data;
    }),

  updateCurrency: (id, body) =>
    withToken(async (token) => {
      const response = await requests.put(`/currency/${id}`, body, token);
      return response?.data;
    }),

  updateManyCurrencies: (body) =>
    withToken(async (token) => {
      const response = await requests.patch(
        "currency/update/many",
        body,
        token
      );
      return response?.data;
    }),

  updateEnabledStatus: (id, body) =>
    withToken(async (token) => {
      const response = await requests.put(
        `/currency/status/enabled/${id}`,
        body,
        token
      );
      return response?.data;
    }),

  updateLiveExchangeRateStatus: (id, body) =>
    withToken(async (token) => {
      const response = await requests.put(
        `/currency/status/live-exchange-rates/${id}`,
        body,
        token
      );
      return response?.data;
    }),

  deleteCurrency: (id) =>
    withToken(async (token) => {
      const response = await requests.delete(`/currency/${id}`, token);
      return response?.data;
    }),

  deleteManyCurrency: (body) =>
    withToken(async (token) => {
      const response = await requests.patch("/currency/delete/many", body, token);
      return response?.data;
    }),
};

export default CurrencyServices;
