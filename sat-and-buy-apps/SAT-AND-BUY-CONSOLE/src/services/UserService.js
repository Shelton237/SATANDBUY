// services/UserService.js
import { KEYCLOAK_ADMIN_BASE } from "@/config/keycloak";
import HttpService from "@/services/httpService";
import RoleService from "@/services/RoleService";

const http = new HttpService(KEYCLOAK_ADMIN_BASE, {
  "Content-Type": "application/json"
});

const mapKeycloakUser = (data) => ({
  id: data.id || data.sub || "",
  email: data.email || "",
  firstName: data.given_name || data.firstName || "",
  lastName: data.family_name || data.lastName || "",
  phone: data.phone || "",
  username: data.username || data.preferred_username || "",
  enabled: data.enabled ?? true,
  createdTimestamp: data.createdTimestamp || null,
  roles: data.realmRoles || data.realm_access?.roles || []
});

const UserService = {
  mapKeycloakUser,

  async getAllUsers(token) {
    const res = await http.get("/users", token);
    const users = res.data;

    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        try {
          const userRoles = await RoleService.getUserRoles(user.id, token);
          const roles = userRoles.map((r) => r.name);
          return { ...mapKeycloakUser(user), roles };
        } catch (error) {
          console.error(`Failed to fetch roles for user ${user.id}`, error);
          return { ...mapKeycloakUser(user), roles: [] };
        }
      })
    );
    return enrichedUsers;
  },

  async getUserById(id, token) {
    const res = await http.get(`/users/${id}`, token);
    return mapKeycloakUser(res.data);
  },

  async createUser(data, token) {
    console.log("Creating user with token:", token);
    const res = await http.post(`/users`, data, token);
    return res.data;
  },

  async updateUser(id, data, token) {
    const res = await http.put(`/users/${id}`, data, token);
    return res.data;
  },

  async deleteUser(id, token) {
    const res = await http.delete(`/users/${id}`, token);
    return res.status === 204;
  },

  async resetPassword(id, newPassword, token) {
    const res = await http.put(`/users/${id}/reset-password`, {
      type: "password",
      value: newPassword,
      temporary: false
    }, token);
    return res.status === 204;
  },

  async updateStatus(id, enabled, token) {
    const res = await http.put(`/users/${id}`, { enabled }, token);
    return res.status === 204;
  }
};

export default UserService;