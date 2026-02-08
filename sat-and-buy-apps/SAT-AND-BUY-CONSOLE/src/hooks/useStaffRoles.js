// hooks/useStaffRoles.js
import { useEffect, useState } from "react";
import AdminServices from "@/services/AdminServices";
import { STAFF_ROLES } from "@/constants/roles";

const DEFAULT_ROLES = STAFF_ROLES.map(({ value, label }) => ({
  id: value,
  name: value,
  description: label,
}));

const useStaffRoles = () => {
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await AdminServices.getAllStaff();
        const staffList = res.data || [];
        const unique = [
          ...new Set(staffList.map((staff) => staff.role).filter(Boolean)),
        ];
        const merged = [...DEFAULT_ROLES];
        unique.forEach((name) => {
          if (!merged.some((role) => role.name === name)) {
            merged.push({ id: name, name, description: name });
          }
        });
        setRoles(merged);
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
