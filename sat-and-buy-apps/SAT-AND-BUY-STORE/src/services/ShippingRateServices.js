import { orderRequests as requests } from "./httpServices";

const ShippingRateServices = {
  getRates: async ({ country = "", city = "" } = {}) => {
    const params = new URLSearchParams();
    if (country) params.append("country", country);
    if (city) params.append("city", city);
    const query = params.toString();
    return requests
      .get(
        query ? `/shipping-rate/public?${query}` : "/shipping-rate/public"
      )
      .then((res) => res?.rates || res || []);
  },

  getLocations: async () => {
    return requests.get("/shipping-rate/locations").then((res) => res || []);
  },
};

export default ShippingRateServices;
