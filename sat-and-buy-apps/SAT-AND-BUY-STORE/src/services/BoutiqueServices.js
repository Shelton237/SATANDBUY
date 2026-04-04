import requests from "./httpServices";

// Toutes les requêtes boutique utilisent `requests` (NEXT_PUBLIC_API_BASE_URL → /api).
// authRequests pointe sur NEXT_PUBLIC_AUTH_BASE_URL = .../api/auth ce qui causerait
// des 404 du type /api/auth/boutiques/... Le token est injecté sur tous les instances
// via setToken() dans UserContext, donc requests est déjà authentifié.

const BoutiqueServices = {
  // Liste des boutiques publiques
  listBoutiques: async ({ businessType = "", city = "", search = "", page = 1, limit = 12 } = {}) => {
    const params = new URLSearchParams();
    if (businessType) params.set("businessType", businessType);
    if (city) params.set("city", city);
    if (search) params.set("search", search);
    params.set("page", page);
    params.set("limit", limit);
    return requests.get(`/boutiques?${params.toString()}`);
  },

  // Détail d'une boutique par slug
  getBoutiqueBySlug: async (slug) => {
    return requests.get(`/boutiques/slug/${slug}`);
  },

  // Ma boutique (connecté)
  getMyBoutique: async () => {
    return requests.get("/boutiques/me");
  },

  // Créer sa boutique
  createBoutique: async (data) => {
    return requests.post("/boutiques", data);
  },

  // Mettre à jour sa boutique
  updateMyBoutique: async (data) => {
    return requests.put("/boutiques/me", data);
  },

  // Uploader une image vers le serveur
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return requests.postForm("/boutiques/upload", formData);
  },

  // Suivre / ne plus suivre une boutique
  toggleFollow: async (boutiqueId) => {
    return requests.post(`/boutiques/${boutiqueId}/follow`);
  },

  // Posts d'une boutique
  getBoutiquePosts: async (boutiqueId, { page = 1, limit = 10 } = {}) => {
    return requests.get(`/boutique-posts/boutique/${boutiqueId}?page=${page}&limit=${limit}`);
  },

  // Mes posts
  getMyPosts: async ({ page = 1, limit = 10, status = "" } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (status) params.set("status", status);
    return requests.get(`/boutique-posts/me?${params.toString()}`);
  },

  // Créer un post
  createPost: async (data) => {
    return requests.post("/boutique-posts", data);
  },

  // Mettre à jour un post
  updatePost: async (id, data) => {
    return requests.put(`/boutique-posts/${id}`, data);
  },

  // Supprimer un post
  deletePost: async (id) => {
    return requests.post(`/boutique-posts/${id}/delete`);
  },

  // Liker / unliker un post
  toggleLike: async (postId) => {
    return requests.post(`/boutique-posts/${postId}/like`);
  },

  // Commentaires d'un post
  getPostComments: async (postId, { page = 1, limit = 20 } = {}) => {
    return requests.get(`/boutique-comments/post/${postId}?page=${page}&limit=${limit}`);
  },

  // Réponses à un commentaire
  getCommentReplies: async (commentId) => {
    return requests.get(`/boutique-comments/${commentId}/replies`);
  },

  // Ajouter un commentaire
  addComment: async (postId, data) => {
    return requests.post(`/boutique-comments/post/${postId}`, data);
  },

  // Modifier un commentaire
  updateComment: async (id, data) => {
    return requests.put(`/boutique-comments/${id}`, data);
  },

  // Commandes boutique
  createBoutiqueOrder: async (data) => {
    return requests.post("/boutique-orders", data);
  },

  getMyBoutiqueOrders: async ({ page = 1, limit = 20 } = {}) => {
    return requests.get(`/boutique-orders/me?page=${page}&limit=${limit}`);
  },

  getBoutiqueReceivedOrders: async ({ page = 1, limit = 20, status = "" } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (status) params.set("status", status);
    return requests.get(`/boutique-orders/boutique?${params.toString()}`);
  },

  updateBoutiqueOrderStatus: async (orderId, status) => {
    return requests.put(`/boutique-orders/${orderId}/status`, { status });
  },
};

export default BoutiqueServices;
