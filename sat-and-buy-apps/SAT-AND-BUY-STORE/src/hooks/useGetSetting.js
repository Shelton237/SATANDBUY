import Cookies from "js-cookie";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

//internal import
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

        // Deep-merge: local defaults first, API data overrides section by section.
        // This ensures fields missing from the DB are always filled from local defaults,
        // fixing empty header, footer, and banner sections.
        const localDefaults = storeCustomization?.setting || {};
        const merged = hasRemoteData
          ? {
              navbar: { ...localDefaults.navbar, ...(res.navbar || {}) },
              home: { ...localDefaults.home, ...(res.home || {}) },
              footer: { ...localDefaults.footer, ...(res.footer || {}) },
              about_us: { ...localDefaults.about_us, ...(res.about_us || {}) },
              contact_us: { ...localDefaults.contact_us, ...(res.contact_us || {}) },
              slider: { ...localDefaults.slider, ...(res.slider || {}) },
              offers: { ...localDefaults.offers, ...(res.offers || {}) },
              faq: { ...localDefaults.faq, ...(res.faq || {}) },
              privacy_policy: { ...localDefaults.privacy_policy, ...(res.privacy_policy || {}) },
              term_and_condition: { ...localDefaults.term_and_condition, ...(res.term_and_condition || {}) },
              checkout: { ...localDefaults.checkout, ...(res.checkout || {}) },
              dashboard: { ...localDefaults.dashboard, ...(res.dashboard || {}) },
              slug: { ...localDefaults.slug, ...(res.slug || {}) },
              seo: { ...localDefaults.seo, ...(res.seo || {}) },
              name: "storeCustomizationSetting",
            }
          : {
              ...localDefaults,
              name: "storeCustomizationSetting",
            };

        dispatch(addSetting(merged));
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
        const res = await SettingServices.getGlobalSetting();
        const globalSettingData = {
          ...res,
          name: "globalSetting",
        };
        dispatch(addSetting(globalSettingData));
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
