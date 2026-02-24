import { apiHttp, authHttp } from "@/services/httpClients";
import { withToken } from "@/utils/tokenHelper";

const AdminServices = {
  registerAdmin(body) {
    return authHttp.post("/admin/register", body);
  },

  loginAdmin(body) {
    return authHttp.post("/admin/login", body);
  },

  forgetPassword(body) {
    return authHttp.put("/admin/forget-password", body);
  },

  resetPassword(body) {
    return authHttp.put("/admin/reset-password", body);
  },

  signUpWithProvider(body) {
    return authHttp.post("/admin/signup", body);
  },

  addStaff(body) {
    return withToken((token) => apiHttp.post("/admin/add", body, token));
  },

  getAllStaff() {
    return withToken((token) => apiHttp.get("/admin", token));
  },

  getStaffById(id) {
    return withToken((token) => apiHttp.get(`/admin/${id}`, token));
  },

  updateStaff(id, body) {
    return withToken((token) => apiHttp.put(`/admin/${id}`, body, token));
  },

  updateStaffStatus(id, status) {
    return withToken((token) =>
      apiHttp.put(`/admin/update-status/${id}`, { status }, token)
    );
  },

  deleteStaff(id) {
    return withToken((token) => apiHttp.delete(`/admin/${id}`, token));
  },

  getDriverAvailability(id, { date, orderId } = {}) {
    const params = new URLSearchParams();
    if (date) params.append("date", date);
    if (orderId) params.append("orderId", orderId);
    const query = params.toString();
    return withToken((token) =>
      apiHttp.get(
        `/admin/${id}/availability${query ? `?${query}` : ""}`,
        token
      )
    );
  },
};

export default AdminServices;
