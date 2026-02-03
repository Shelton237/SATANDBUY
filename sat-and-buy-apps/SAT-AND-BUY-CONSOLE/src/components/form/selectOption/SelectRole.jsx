// components/SelectRole.jsx
import React from "react";
import { Select } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";

const SelectRole = ({ setRole, register, name, label, options = [], defaultValue }) => {
  const { t } = useTranslation();

  return (
    <Select
      name={name}
      defaultValue={defaultValue || ""}
      onChange={(e) => setRole(e.target.value)}
      {...register(name, {
        required: `${label} is required!`,
      })}
    >
      <option value="" hidden>
        {t("DrawerStaffRole")}
      </option>
      {options.map((role) => (
        <option key={role.value} value={role.value}>
          {role.label}
        </option>
      ))}
    </Select>
  );
};

export default SelectRole;