import HttpService from "./httpService";

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;
const requests = new HttpService(API_BASE_URL, {
  "Content-Type": "application/json",
});

const SettingServices = {
  // global setting all function
  addGlobalSetting: async (body) => {
    const response = await requests.post("/setting/global/add", body);
    return response?.data;
  },

  getGlobalSetting: async () => {
    const response = await requests.get("/setting/global/all");
    return response?.data;
  },

  updateGlobalSetting: async (body) => {
    const response = await requests.put(`/setting/global/update`, body);
    return response?.data;
  },

  // store setting all function
  addStoreSetting: async (body) => {
    const response = await requests.post("/setting/store-setting/add", body);
    return response?.data;
  },

  getStoreSetting: async () => {
    const response = await requests.get("/setting/store-setting/all");
    return response?.data;
  },

  updateStoreSetting: async (body) => {
    const response = await requests.put(`/setting/store-setting/update`, body);
    return response?.data;
  },

  // store customization setting all function
  addStoreCustomizationSetting: async (body) => {
    const response = await requests.post(
      "/setting/store/customization/add",
      body
    );
    return response?.data;
  },

  getStoreCustomizationSetting: async () => {
    const response = await requests.get("/setting/store/customization/all");
    return response?.data;
  },

  updateStoreCustomizationSetting: async (body) => {
    const response = await requests.put(
      `/setting/store/customization/update`,
      body
    );
    return response?.data;
  },
};

export default SettingServices;
