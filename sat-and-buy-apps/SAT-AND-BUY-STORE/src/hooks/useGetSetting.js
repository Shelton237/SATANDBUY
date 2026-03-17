import Cookies from "js-cookie";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

//internal import
// import useAsync from "./useAsync";
import SettingServices from "@services/SettingServices";
import { addSetting } from "@redux/slice/settingSlice";
import { storeCustomization } from "@utils/storeCustomizationSetting";

const hasContent = (value = {}) => {
  if (!value || typeof value !== "object") return false;
  const clone = { ...value };
  delete clone.name;
  return Object.values(clone).some((item) => {
    if (item === null || item === undefined) return false;
    if (Array.isArray(item)) return item.length > 0;
    if (typeof item === "object") return Object.keys(item).length > 0;
    return String(item).trim().length > 0;
  });
};

const useGetSetting = () => {
  const lang = Cookies.get("_lang");
  const dispatch = useDispatch();

  // const { data: globalSetting } = useAsync(SettingServices.getGlobalSetting);
  // const {
  //   data: storeCustomizationSetting,
  //   loading,
  //   error,
  // } = useAsync(SettingServices.getStoreCustomizationSetting);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const settings = useSelector((state) => state.setting.settingItem);

  const globalSetting = settings.find(
    (value) => value.name === "globalSetting"
  );

  const storeCustomizationSetting = settings.find(
    (value) => value.name === "storeCustomizationSetting"
  );

  const shouldFetchStoreCustomization = useMemo(
    () => !hasContent(storeCustomizationSetting),
    [storeCustomizationSetting]
  );

  const shouldFetchGlobalSetting = useMemo(
    () => !hasContent(globalSetting),
    [globalSetting]
  );

  useEffect(() => {
    // Function to fetch and add the setting
    const fetchAndAddSetting = async () => {
      try {
        setLoading(true);
        const res = await SettingServices.getStoreCustomizationSetting();
        const hasRemoteData = hasContent(res);

        const storeCustomizationSettingData = hasRemoteData
          ? {
              ...res,
              name: "storeCustomizationSetting",
            }
          : {
              ...storeCustomization?.setting,
              name: "storeCustomizationSetting",
            };

        dispatch(addSetting(storeCustomizationSettingData));

        setLoading(false);
      } catch (err) {
        setError(err.message);
        console.log("Error on getting storeCustomizationSetting setting", err);
        setLoading(false);
        const storeCustomizationData = {
          ...storeCustomization?.setting,
          name: "storeCustomizationSetting",
        };
        dispatch(addSetting(storeCustomizationData));
      }
    };

    const fetchGlobalSetting = async () => {
      try {
        // setLoading(true);
        // console.log("globalSetting setting not available");
        const res = await SettingServices.getGlobalSetting();
        const globalSettingData = {
          ...res,
          name: "globalSetting",
        };

        dispatch(addSetting(globalSettingData));

        // setLoading(false);
      } catch (err) {
        setError(err.message);
        console.log("Error on getting globalSetting setting", err);
      }
    };

    // Check if the setting is not in the store and fetch it
    if (shouldFetchStoreCustomization) {
      fetchAndAddSetting();
    }

    if (shouldFetchGlobalSetting) {
      fetchGlobalSetting();
    }

    // Check if the "lang" value is not set and set a default value
    if (!lang) {
      Cookies.set("_lang", "fr", {
        sameSite: "None",
        secure: true,
      });
    }
  }, [lang, shouldFetchGlobalSetting, shouldFetchStoreCustomization]);

  return {
    lang,
    error,
    loading,
    globalSetting,
    storeCustomizationSetting,
  };
};

export default useGetSetting;
