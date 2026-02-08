import HttpService from "@/services/httpService";

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

const http = new HttpService(API_BASE_URL, {
  "Content-Type": "application/json"
});

const AdminServices = {
  registerAdmin(body) {
    return http.post("/admin/register", body);
  },

  loginAdmin(body) {
    return http.post("/admin/login", body);
  },

  forgetPassword(body) {
    return http.put("/admin/forget-password", body);
  },

  resetPassword(body) {
    return http.put("/admin/reset-password", body);
  },

  signUpWithProvider(body) {
    return http.post("/admin/signup", body);
  },

  addStaff(body) {
    return http.post("/admin/add", body);
  },

  getAllStaff() {
    return http.get("/admin");
  },

  getStaffById(id) {
    return http.get(`/admin/${id}`);
  },

  updateStaff(id, body) {
    return http.put(`/admin/${id}`, body);
  },

  updateStaffStatus(id, status) {
    return http.put(`/admin/update-status/${id}`, { status });
  },

  deleteStaff(id) {
    return http.delete(`/admin/${id}`);
  },

  getDriverAvailability(id, { date, orderId } = {}) {
    const params = new URLSearchParams();
    if (date) params.append("date", date);
    if (orderId) params.append("orderId", orderId);
    const query = params.toString();
    return http.get(
      `/admin/${id}/availability${query ? `?${query}` : ""}`
    );
  },
};

export default AdminServices;
