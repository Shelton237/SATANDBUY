// hooks/useStaffRoles.js
import { useEffect, useState } from "react";
import AdminServices from "@/services/AdminServices";

const DEFAULT_ROLES = [
  "Admin",
  "Super Admin",
  "Cashier",
  "Manager",
  "CEO",
  "Driver",
  "Security Guard",
  "Accountant"
].map((name) => ({ id: name, name, description: name }));

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
          ...new Set(
            staffList
              .map((staff) => staff.role)
              .filter(Boolean)
          )
        ];
        if (unique.length) {
          setRoles(unique.map((name) => ({ id: name, name, description: name })));
        }
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
