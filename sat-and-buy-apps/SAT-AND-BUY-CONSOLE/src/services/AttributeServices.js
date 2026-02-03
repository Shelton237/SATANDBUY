import HttpService from "@/services/httpService";
import { withToken } from "@/utils/tokenHelper";
import { ENDPOINT } from "@/config/product-services";

const { PRODUCT_SERVICE } = ENDPOINT;
const { brands, sizes, colors } = PRODUCT_SERVICE;

const httpService = new HttpService(PRODUCT_SERVICE.base);

const getAttributeEndpoint = (code) => {
  const endpoints = {
    "sizes": sizes,
    "colors": colors,
    "brands": brands
  };
  return endpoints[code];
};

const AttributeServices = {
  getAll: ({ page = 0, size = 20, sortBy = "name", sortDir = "ASC" }, code) =>
    withToken(async (token) => {
      try {
        const endpoint = getAttributeEndpoint(code);
        const params = new URLSearchParams({ page, size, sortBy, sortDir }).toString();
        const response = await httpService.get(endpoint.list(params), token);

        console.log("API Response:", response.data);

        const apiData = response.data || {};
        const content = Array.isArray(apiData.content) ? apiData.content : [];
        console.log("Processed Content:", content);
        return {
          data: content,
          variants: content,
          pagination: {
            totalElements: apiData.totalElements ?? 0,
            totalPages: apiData.totalPages ?? 0,
            size: apiData.size ?? size,
            number: apiData.number ?? page,
            last: apiData.last ?? true,
            first: apiData.first ?? true,
          },
        };
      } catch (error) {
        console.error(`Erreur lors de la récupération des attributs ${code}:`, error);
        return {
          data: [],
          variants: [],
          pagination: {
            totalElements: 0,
            totalPages: 0,
            size: 0,
            number: page,
            last: true,
            first: true,
          },
        };
      }
    }),

  getAllRaw: ({ page = 0, size = 1000, sortBy = "name", sortDir = "ASC", code } = {}) =>
    withToken(async (token) => {
      const endpoint = getAttributeEndpoint(code);
      const params = new URLSearchParams({ page, size, sortBy, sortDir }).toString();
      const response = await httpService.get(endpoint.list(params), token);
      return response?.data ?? {};
    }),

  getById: (id, code) =>
    withToken(async (token) => {
      try {
        const endpoint = getAttributeEndpoint(code);
        const response = await httpService.get(endpoint.getById(id), token);
        console.log("Attribute retrieved:", response.data);
        return response?.data ?? {};
      } catch (error) {
        console.error(`Erreur lors de la récupération de l'attribut ${code}:`, error);
        throw new Error(`Impossible de récupérer l'attribut ${code}`);
      }
    }),

  create: (data, code) =>
    withToken(async (token) => {
      const endpoint = getAttributeEndpoint(code);
      const response = await httpService.post(endpoint.create(), data, token);
      return response?.data ?? {};
    }),

  update: (id, data, code) =>
    withToken(async (token) => {
      const endpoint = getAttributeEndpoint(code);
      const response = await httpService.put(endpoint.update(id), data, token);
      return response?.data ?? {};
    }),

  delete: (id, code) =>
    withToken(async (token) => {
      const endpoint = getAttributeEndpoint(code);
      const response = await httpService.delete(endpoint.delete(id), token);
      return response?.data ?? {};
    }),

  getCounts: () =>
    withToken(async (token) => {
      try {
        const counts = {
          sizes: 0,
          colors: 0,
          brands: 0
        };

        await Promise.all(
          Object.keys(counts).map(async (code) => {
            try {
              const endpoint = getAttributeEndpoint(code);
              const response = await httpService.get(endpoint.list("?size=1"), token);
              counts[code] = response.data?.totalElements || 0;
            } catch (error) {
              console.error(`Erreur comptage ${code}:`, error);
              counts[code] = 0;
            }
          })
        );


        return counts;
      } catch (error) {
        console.error("Erreur lors de la récupération des comptes:", error);
        return {
          sizes: 0,
          colors: 0,
          brands: 0
        };
      }
    }),
};

export default AttributeServices;
