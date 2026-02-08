import dayjs from "dayjs";
import SettingServices from "@/services/SettingServices";
import { useDispatch, useSelector } from "react-redux";
import { addSetting, removeSetting } from "@/reduxStore/slice/settingSlice";
import { useContext, useEffect, useState } from "react";
import { SidebarContext } from "@/context/SidebarContext";

const sanitizeSettingPayload = (payload) => {
  try {
    return JSON.parse(JSON.stringify(payload || {}));
  } catch (err) {
    return payload || {};
  }
};

const useUtilsFunction = () => {
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { lang } = useContext(SidebarContext);

  const settings = useSelector((state) => state.setting.settingItem);

  const globalSetting = settings.find(
    (value) => value.name === "globalSetting"
  );

  // console.log("globalSetting", globalSetting);
  //for date and time format
  const showTimeFormat = (data, timeFormat) => {
    return dayjs(data).format(timeFormat);
  };

  const showDateFormat = (data) => {
    return dayjs(data).format(globalSetting?.default_date_format);
  };

  const showDateTimeFormat = (data) => {
    return dayjs(data).format(`${globalSetting?.default_date_format}  h:mm A`);
  };

  //for formatting number

  const getNumber = (value = 0) => {
    return Number(parseFloat(value || 0).toFixed(2));
  };

  const getNumberTwo = (value = 0) => {
    return parseFloat(value || 0).toFixed(globalSetting?.floating_number || 2);
  };

  //for translation
  const showingTranslateValue = (data) => {
    return data !== undefined && Object?.keys(data).includes(lang)
      ? data[lang]
      : data?.en;
  };

  const showingImage = (data) => {
    return data !== undefined && data;
  };

  const showingUrl = (data) => {
    return data !== undefined ? data : "!#";
  };

  const currency = globalSetting?.default_currency || "FCFA";

  useEffect(() => {
    // console.log("globalSetting", globalSetting);
    const fetchGlobalSetting = async () => {
      try {
        setLoading(true);
        const res = await SettingServices.getGlobalSetting();
        const globalSettingData = {
          ...sanitizeSettingPayload(res),
          name: "globalSetting",
        };

        dispatch(addSetting(globalSettingData));
      } catch (err) {
        setError(err.message);
        console.error(
          "Error on getting storeCustomizationSetting setting",
          err
        );
      } finally {
        setLoading(false);
      }
    };

    if (!globalSetting) {
      fetchGlobalSetting();
    }
  }, [globalSetting]);

  return {
    error,
    loading,
    currency,
    getNumber,
    getNumberTwo,
    showTimeFormat,
    showDateFormat,
    showingImage,
    showingUrl,
    globalSetting,
    showDateTimeFormat,
    showingTranslateValue,
  };
};

export default useUtilsFunction;
