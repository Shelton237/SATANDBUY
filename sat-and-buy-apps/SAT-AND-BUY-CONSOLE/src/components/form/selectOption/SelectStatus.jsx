import React, { useContext, useMemo } from "react";
import { Select } from "@windmill/react-ui";

//internal import
import OrderServices from "@/services/OrderServices";
import { notifySuccess, notifyError } from "@/utils/toast";
import { SidebarContext } from "@/context/SidebarContext";
import { AdminContext } from "@/context/AdminContext";

const STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "Sorting", label: "Sorting" },
  { value: "ReadyForDelivery", label: "Ready For Delivery" },
  { value: "Processing", label: "Processing" },
  { value: "Delivered", label: "Delivered" },
  { value: "Cancel", label: "Cancel" },
];

const ROLE_STATUS_MAP = {
  Trieur: ["Pending", "Sorting", "ReadyForDelivery", "Processing"],
  Vendeur: ["Processing", "ReadyForDelivery", "Delivered", "Cancel"],
};

const SelectStatus = ({ id, order }) => {
  const { setIsUpdate } = useContext(SidebarContext);
  const { authData } = useContext(AdminContext);
  const role = authData?.user?.role || "Admin";

  const allowedValues = useMemo(() => {
    if (role === "Admin") return STATUS_OPTIONS.map((opt) => opt.value);
    return ROLE_STATUS_MAP[role] || ["Pending", "Processing", "Delivered", "Cancel"];
  }, [role]);

  const allowedOptions = useMemo(
    () => STATUS_OPTIONS.filter((opt) => allowedValues.includes(opt.value)),
    [allowedValues]
  );

  const allowedSet = useMemo(() => new Set(allowedValues), [allowedValues]);

  const handleChangeStatus = (orderId, status) => {
    if (!allowedSet.has(status)) {
      notifyError("Ce rôle ne peut pas appliquer ce statut.");
      return;
    }
    OrderServices.updateOrder(orderId, { status })
      .then((res) => {
        notifySuccess(res.message);
        setIsUpdate(true);
      })
      .catch((err) => notifyError(err.message));
  };

  if (allowedOptions.length === 0) {
    return (
      <span className="text-xs text-gray-400 dark:text-gray-500">
        Aucune action disponible
      </span>
    );
  }

  return (
    <Select
      onChange={(e) => handleChangeStatus(id, e.target.value)}
      className="h-8"
      defaultValue=""
    >
      <option value="" hidden>
        {order?.status}
      </option>
      {allowedOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
};

export default SelectStatus;
