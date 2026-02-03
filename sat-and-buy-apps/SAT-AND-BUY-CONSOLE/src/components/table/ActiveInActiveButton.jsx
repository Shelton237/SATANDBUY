import React, { useContext } from "react";
import Switch from "react-switch";
import { SidebarContext } from "@/context/SidebarContext";
import { notifyError, notifySuccess } from "@/utils/toast";
import AuthService from "@/services/AuthService";
import UserService from "@/services/UserService";

const ActiveInActiveButton = ({ id, status }) => {
  const { setIsUpdate } = useContext(SidebarContext);

  const handleChangeStatus = async () => {
    const token = AuthService.getAccessToken();
    try {
      const newEnabled = status !== "Active";
      await UserService.updateStatus(id, newEnabled, token);
      setIsUpdate(true);
      notifySuccess(`User ${newEnabled ? "enabled" : "disabled"} successfully.`);
    } catch (err) {
      notifyError(err?.response?.data?.message || err.message);
    }
  };

  return (
    <Switch
      onChange={handleChangeStatus}
      checked={status === "Active"}
      className="react-switch md:ml-0"
      width={30}
      height={15}
      handleDiameter={13}
      offColor="#E53E3E"
      onColor={"#2F855A"}
    />
  );
};

export default ActiveInActiveButton;
