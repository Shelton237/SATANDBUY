// services/RoleService.js
import { KEYCLOAK_ADMIN_BASE } from "@/config/keycloak";
import HttpService from "@/services/httpService";

const http = new HttpService(KEYCLOAK_ADMIN_BASE, {
  "Content-Type": "application/json"
});

const mapKeycloakRole = (data) => ({
  id: data.id || "",
  name: data.name || "",
  description: data.description || "",
  composite: data.composite || false,
  clientRole: data.clientRole || false,
  containerId: data.containerId || ""
});

const RoleService = {
  mapKeycloakRole,

  async getAllRoles(token) {
    const res = await http.get("/roles", token);
    return res.data.map(mapKeycloakRole);
  },

  async getRoleByName(name, token) {
    const res = await http.get(`/roles/${name}`, token);
    return mapKeycloakRole(res.data);
  },

  async createRole(data, token) {
    const res = await http.post("/roles", data, token);
    return res.status === 201;
  },

  async updateRole(name, data, token) {
    const res = await http.put(`/roles/${name}`, data, token);
    return res.status === 204;
  },

  async deleteRole(name, token) {
    const res = await http.delete(`/roles/${name}`, token);
    return res.status === 204;
  },

  async assignRoleToUser(userId, role, token) {
    const res = await http.post(`/users/${userId}/role-mappings/realm`, [role], token);
    return res.status === 204;
  },

  async removeRoleFromUser(userId, role, token) {
    const res = await http.delete(`/users/${userId}/role-mappings/realm`, [role], token);
    return res.status === 204;
  },

  async getUserRoles(userId, token) {
    const res = await http.get(`/users/${userId}/role-mappings/realm`, token);
    return res.data.map(mapKeycloakRole);
  }
};

export default RoleService;
