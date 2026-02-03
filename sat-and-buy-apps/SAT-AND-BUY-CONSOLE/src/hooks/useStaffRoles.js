// hooks/useStaffRoles.js
import { useEffect, useState } from "react";
import RoleService from "@/services/RoleService";
import AuthService from "@/services/AuthService";

const SYSTEM_ROLES = [
  "offline_access",
  "uma_authorization",
  "default-roles-master",
  "create-realm",
];

const useStaffRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = AuthService.getAccessToken();
        const allRoles = await RoleService.getAllRoles(token);
        const filteredRoles = allRoles.filter(
          (role) => role?.name && !SYSTEM_ROLES.includes(role.name)
        );
        setRoles(filteredRoles);
      } catch (err) {
        console.error("Error fetching roles:", err);
        setError("Failed to load roles");
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  return { roles, loading, error };
};

export default useStaffRoles;