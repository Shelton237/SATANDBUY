import { apiHttp } from "@/services/httpClients";
import { withToken } from "@/utils/tokenHelper";

const BoutiqueServices = {
  adminListBoutiques: ({ status = "", page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (status) params.set("status", status);
    return withToken((token) =>
      apiHttp.get(`/boutiques/admin/list?${params.toString()}`, token)
    );
  },

  adminUpdateStatus: (id, body) => {
    return withToken((token) =>
      apiHttp.put(`/boutiques/admin/${id}/status`, body, token)
    );
  },

  adminDeleteBoutique: (id) => {
    return withToken((token) =>
      apiHttp.delete(`/boutiques/admin/${id}`, token)
    );
  },

  // Catalogue admin
  adminListCatalog: ({ page = 1, limit = 20, featured = "", type = "", search = "" } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (featured !== "") params.set("featured", featured);
    if (type) params.set("type", type);
    if (search) params.set("search", search);
    return withToken((token) =>
      apiHttp.get(`/boutique-catalog/admin?${params.toString()}`, token)
    );
  },

  adminToggleFeature: (id) => {
    return withToken((token) =>
      apiHttp.put(`/boutique-catalog/${id}/feature`, {}, token)
    );
  },
};

export default BoutiqueServices;
