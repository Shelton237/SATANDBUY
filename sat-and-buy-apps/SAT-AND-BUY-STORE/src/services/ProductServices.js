import { catalogRequests as requests } from "./httpServices";

const ProductServices = {
  getShowingProducts: async () => {
    return requests.get("/products/show");
  },
  getShowingStoreProducts: async ({ category = "", title = "", slug = "" }) => {
    return requests.get(
      `/products/store?category=${category}&title=${title}&slug=${slug}`
    );
  },
  getShowingStoreServices: async () => {
    return requests.get(`/products/store?type=service`);
  },
  getDiscountedProducts: async () => {
    return requests.get("/products/discount");
  },

  getProductBySlug: async (slug) => {
    return requests.get(`/products/${slug}`);
  },

  // Boutique owner — soumettre un produit au store (status: pending)
  submitProduct: async (data) => {
    return requests.post("/products/submit", data);
  },

  // Boutique owner — voir ses soumissions
  getMySubmissions: async ({ page = 1, limit = 20, approvalStatus = "" } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (approvalStatus) params.set("approvalStatus", approvalStatus);
    return requests.get(`/products/my-submissions?${params.toString()}`);
  },

  // Boutique owner — modifier un produit soumis
  updateMySubmission: async (id, data) => {
    return requests.put(`/products/my-submissions/${id}`, data);
  },

  // Boutique owner — supprimer un produit soumis
  deleteMySubmission: async (id) => {
    return requests.delete(`/products/my-submissions/${id}`);
  },

  // Produits boutique approuvés (marketplace public)
  getBoutiqueStoreProducts: async ({ page = 1, limit = 20, type = "", boutiqueId = "" } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (type) params.set("type", type);
    if (boutiqueId) params.set("boutiqueId", boutiqueId);
    return requests.get(`/products/store/boutique?${params.toString()}`);
  },
};

export default ProductServices;
