import React, { useContext, useEffect, useState } from "react";
import Switch from "react-switch";
import { useLocation } from "react-router-dom";

//internal import
import { SidebarContext } from "@/context/SidebarContext";
import AdminServices from "@/services/AdminServices";
import AttributeServices from "@/services/AttributeServices";
import CategoryServices from "@/services/products/CategoryServices";
import CouponServices from "@/services/CouponServices";
import CurrencyServices from "@/services/CurrencyServices";
import LanguageServices from "@/services/LanguageServices";
import ProductServices from "@/services/ProductServices";
import { notifyError, notifySuccess } from "@/utils/toast";

const ACTIVE_STATES = ["show", "active", "enabled", "published", "true", "1"];

const isValueActive = (value) => {
  if (typeof value === "boolean") return value;
  const normalized = value?.toString().toLowerCase();
  return ACTIVE_STATES.includes(normalized);
};

const ShowHideButton = ({ id, status, category, currencyStatusName }) => {
  const location = useLocation();
  const { setIsUpdate } = useContext(SidebarContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(isValueActive(status));

  useEffect(() => {
    setIsActive(isValueActive(status));
  }, [status]);

  const handleChangeStatus = async () => {
    const previousState = isActive;
    const nextIsActive = !previousState;
    setIsActive(nextIsActive);
    setIsLoading(true);
    const uiStatus = nextIsActive ? "ACTIVE" : "INACTIVE";
    const apiStatus = nextIsActive ? "show" : "hide";

    try {
      if (location.pathname === "/categories" || category) {
        const res = await CategoryServices.updateOne(id, {
          status: uiStatus,
        });
        setIsUpdate(true);
        notifySuccess(res.message);
      } else if (location.pathname === "/products") {
        const res = await ProductServices.updateStatus(id, {
          status: apiStatus,
        });
        setIsUpdate(true);
        notifySuccess(res.message);
      } else if (location.pathname === "/languages") {
        const res = await LanguageServices.updateStatus(id, {
          status: apiStatus,
        });
        setIsUpdate(true);
        notifySuccess(res.message);
      } else if (location.pathname === "/currencies") {
        if (currencyStatusName === "status") {
          const res = await CurrencyServices.updateEnabledStatus(id, {
            status: apiStatus,
          });
          setIsUpdate(true);
          notifySuccess(res.message);
        } else {
          const res = await CurrencyServices.updateLiveExchangeRateStatus(id, {
            live_exchange_rates: apiStatus,
          });
          setIsUpdate(true);
          notifySuccess(res.message);
        }
      } else if (location.pathname === "/attributes") {
        const res = await AttributeServices.updateStatus(id, {
          status: apiStatus,
        });
        setIsUpdate(true);
        notifySuccess(res.message);
      } else if (location.pathname.startsWith("/attributes/")) {
        const res = await AttributeServices.updateChildStatus(id, {
          status: apiStatus,
        });
        setIsUpdate(true);
        notifySuccess(res.message);
      } else if (location.pathname === "/coupons") {
        const res = await CouponServices.updateStatus(id, {
          status: apiStatus,
        });
        setIsUpdate(true);
        notifySuccess(res.message);
      } else if (location.pathname === "/our-staff") {
        await AdminServices.updateStaffStatus(id, uiStatus);
        setIsUpdate(true);
        notifySuccess("Statut du membre du staff mis à jour");
      }
    } catch (err) {
      setIsActive(previousState);
      notifyError(err?.response?.data?.message || err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Switch
      onChange={handleChangeStatus}
      checked={isActive}
      className={`react-switch md:ml-0 ${isLoading ? "opacity-50" : ""}`}
      disabled={isLoading}
      uncheckedIcon={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            width: 120,
            fontSize: 14,
            color: "white",
            paddingRight: 22,
            paddingTop: 1,
          }}
        ></div>
      }
      width={30}
      height={15}
      handleDiameter={13}
      offColor="#E53E3E"
      onColor={"#2F855A"}
      checkedIcon={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: 73,
            height: "100%",
            fontSize: 14,
            color: "white",
            paddingLeft: 20,
            paddingTop: 1,
          }}
        ></div>
      }
    />
  );
};

export default ShowHideButton;
