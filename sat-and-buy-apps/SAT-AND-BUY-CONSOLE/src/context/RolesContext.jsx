// File: context/RolesContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import RoleService from "@/services/RoleService";
import AuthService from "@/services/AuthService";

const RolesContext = createContext();

export const RolesProvider = ({ children }) => {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const token = AuthService.getAccessToken();
        console.log("🔑 Access Token:", token);

        const fetchedRoles = await RoleService.getAllRoles(token);
        console.log("✅ Fetched Roles:", fetchedRoles);

        setRoles(fetchedRoles);
      } catch (err) {
        console.error("❌ Error loading roles:", err);
      }
    };
    loadRoles();
  }, []);

  return (
    <RolesContext.Provider value={roles}>
      {children}
    </RolesContext.Provider>
  );
};

export const useRoles = () => useContext(RolesContext);