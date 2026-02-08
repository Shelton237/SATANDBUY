// components/SelectRole.jsx
import React from "react";
import { Select } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { STAFF_ROLES } from "@/constants/roles";

const SelectRole = ({
  setRole,
  register,
  name,
  label,
  options = [],
  defaultValue,
}) => {
  const { t } = useTranslation();
  const availableOptions = options.length ? options : STAFF_ROLES;

  return (
    <Select
      name={name}
      defaultValue={defaultValue || ""}
      onChange={(e) => setRole?.(e.target.value)}
      {...register(name, {
        required: `${label} is required!`,
      })}
    >
      <option value="" hidden>
        {t("DrawerStaffRole")}
      </option>
      {availableOptions.map((role) => (
        <option key={role.value} value={role.value}>
          {role.label}
        </option>
      ))}
    </Select>
  );
};

export default SelectRole;
