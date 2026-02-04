// services/UserService.js
import HttpService from "@/services/httpService";

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

const http = new HttpService(API_BASE_URL, {
  "Content-Type": "application/json"
});

const mapAdminToUser = (admin = {}) => {
  const rawName =
    typeof admin.name === "object"
      ? admin.name?.en || Object.values(admin.name)[0]
      : admin.name || "";
  const nameParts = rawName.trim().split(" ").filter(Boolean);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ");

  return {
    id: admin._id,
    firstName,
    lastName,
    email: admin.email,
    phone: admin.phone || "",
    username: admin.email || admin._id,
    roles: admin.role ? [admin.role] : [],
    enabled: (admin.status || "Active") === "Active",
    status: admin.status || "Active",
    image: admin.image || "",
    createdTimestamp: admin.createdAt || admin.joiningData || null,
    joiningDate: admin.joiningData || admin.createdAt || null
  };
};

const UserService = {
  mapAdminToUser,

  async getAllUsers() {
    const res = await http.get("/admin");
    return (res.data || []).map(mapAdminToUser);
  },

  async getUserById(id) {
    const res = await http.get(`/admin/${id}`);
    return { data: mapAdminToUser(res.data) };
  },

  async createUser(body) {
    const res = await http.post("/admin/add", body);
    const staff = res.data?.staff || res.data;
    return { data: mapAdminToUser(staff) };
  },

  async updateUser(id, body) {
    const res = await http.put(`/admin/${id}`, body);
    const staff = res.data?.staff || res.data;
    return { data: mapAdminToUser(staff) };
  },

  async deleteUser(id) {
    return http.delete(`/admin/${id}`);
  },

  async updateStatus(id, enabled) {
    const status = enabled ? "Active" : "Inactive";
    const res = await http.put(`/admin/update-status/${id}`, { status });
    const staff = res.data?.staff || res.data;
    return { data: mapAdminToUser(staff) };
  }
};

export default UserService;
