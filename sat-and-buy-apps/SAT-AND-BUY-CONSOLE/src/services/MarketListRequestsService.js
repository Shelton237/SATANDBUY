import { catalogHttp as requests } from "@/services/httpClients";
import { withToken } from "@/utils/tokenHelper";

const MarketListRequestsService = {
  adminFind: async ({
    status,
    page = 1,
    limit = 20,
    customerName = "",
  } = {}) =>
    withToken(async (token) => {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);
      if (status) params.append("status", status);
      if (customerName) params.append("customerName", customerName);

      const query = params.toString();
      const url = query
        ? `/customer/market-lists/admin?${query}`
        : "/customer/market-lists/admin";

      const response = await requests.get(url, token);
      return response?.data || response;
    }),
  updateStatus: (id, status) =>
    withToken(async (token) => {
      const response = await requests.patch(
        `/customer/market-lists/${id}/status`,
        { status },
        token
      );
      return response?.data || response;
    }),
};

export default MarketListRequestsService;
