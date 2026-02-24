// services/UserService.js
import { apiHttp as http } from "@/services/httpClients";
import { DEFAULT_DRIVER_SLOTS } from "@/constants/delivery";
import { withToken } from "@/utils/tokenHelper";

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
    joiningDate: admin.joiningData || admin.createdAt || null,
    availabilitySlots: Array.isArray(admin.availabilitySlots) && admin.availabilitySlots.length
      ? admin.availabilitySlots
      : DEFAULT_DRIVER_SLOTS,
  };
};

const UserService = {
  mapAdminToUser,

  async getAllUsers() {
    return withToken(async (token) => {
      const res = await http.get("/admin", token);
      const payload = res?.data;
      const admins = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.admins)
        ? payload.admins
        : [];
      return admins.map(mapAdminToUser);
    });
  },

  async getUserById(id) {
    return withToken(async (token) => {
      const res = await http.get(`/admin/${id}`, token);
      return { data: mapAdminToUser(res.data) };
    });
  },

  async createUser(body) {
    return withToken(async (token) => {
      const res = await http.post("/admin/add", body, token);
      const staff = res.data?.staff || res.data;
      return { data: mapAdminToUser(staff) };
    });
  },

  async updateUser(id, body) {
    return withToken(async (token) => {
      const res = await http.put(`/admin/${id}`, body, token);
      const staff = res.data?.staff || res.data;
      return { data: mapAdminToUser(staff) };
    });
  },

  async deleteUser(id) {
    return withToken((token) => http.delete(`/admin/${id}`, token));
  },

  async updateStatus(id, enabled) {
    const status = enabled ? "Active" : "Inactive";
    return withToken(async (token) => {
      const res = await http.put(`/admin/update-status/${id}`, { status }, token);
      const staff = res.data?.staff || res.data;
      return { data: mapAdminToUser(staff) };
    });
  }
};

export default UserService;
