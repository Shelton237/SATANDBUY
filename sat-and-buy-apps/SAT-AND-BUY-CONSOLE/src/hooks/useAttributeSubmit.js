import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";

//internal import
import { SidebarContext } from "@/context/SidebarContext";
import AttributeServices from "@/services/AttributeServices";
import { notifyError, notifySuccess } from "@/utils/toast";
import useToggleDrawer from "@/hooks/useToggleDrawer";
// import useTranslationValue from "./useTranslationValue";

const useAttributeSubmit = (id, code) => {
  const location = useLocation();
  const { isDrawerOpen, closeDrawer, setIsUpdate, lang } = useContext(SidebarContext);
  const [variants, setVariants] = useState([]);
  const [language, setLanguage] = useState(lang);
  const [resData, setResData] = useState({});
  const [published, setPublished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { setServiceId } = useToggleDrawer();

  const {
    handleSubmit,
    register,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      if (id) {
        const res = await AttributeServices.update(id, data, code);
        setIsUpdate(true);
        setIsSubmitting(false);
        notifySuccess("Attribute updated successfully");
        closeDrawer();
        setServiceId();
      } else {
        const res = await AttributeServices.create(data, code);
        setIsUpdate(true);
        notifySuccess("Attribute created successfully");
        closeDrawer();
        setServiceId();
      }
    } catch (err) {
      notifyError(err ? err.response.data.message : err.message);
      closeDrawer();
      setServiceId();
    } finally {
      setIsSubmitting(false);
    }
  };

  // child attribute
  const onSubmits = async ({ name }) => {
    try {
      setIsSubmitting(true);
      if (id) {
        const res = await AttributeServices.update(
          { ids: location.pathname.split("/")[2], id },
          {
            name: {
              [language]: name,
            },
            status: published ? "show" : "hide",
          }
        );
        setIsUpdate(true);
        setIsSubmitting(false);
        notifySuccess(res.message);
        closeDrawer();
      } else {
        const res = await AttributeServices.create({}, code);
        setIsUpdate(true);
        setIsSubmitting(false);
        notifySuccess(res.message);
        closeDrawer();
      }
    } catch (err) {
      notifyError(err ? err.response.data.message : err.message);
      closeDrawer();
      setIsSubmitting(false);
      setServiceId();
    }
  };


  const handleSelectLanguage = (lang) => {
    setLanguage(lang);
    if (Object.keys(resData).length > 0) {
      setValue("title", resData.title[lang ? lang : "en"]);
      setValue("name", resData.name[lang ? lang : "en"]);
    }
  };

  const removeVariant = (indexToRemove) => {
    setVariants([...variants.filter((_, index) => index !== indexToRemove)]);
  };

  const addVariant = (e) => {
    e.preventDefault();
    if (e.target.value !== "") {
      setVariants([...variants, e.target.value]);
      e.target.value = "";
    }
  };

  useEffect(() => {
    if (!isDrawerOpen) {
      setResData({});
      setValue("name");
      setValue("hexCode");
      setValue("description");
      setValue("logoUrl");
      clearErrors("name");
      clearErrors("hexCode");
      clearErrors("description");
      clearErrors("logoUrl");
      setVariants([]);
      setLanguage(lang);
      setValue("language", language);
      setIsLoading(false);
      return;
    }

    if (id) {
      (async () => {
        try {
          setIsLoading(true);
          const res = await AttributeServices.getById(id, code);
          if (res) {
            setResData(res);
            setValue("name", res.name);
            setValue("hexCode", res.hexCode);
            setValue("description", res.description);
            setValue("logoUrl", res.logoUrl);
          }
        } catch (err) {
          notifyError(err?.response?.data?.message || err?.message);
        }finally {
          setIsLoading(false);
        }
        
      })();
    }
  }, [clearErrors, id, isDrawerOpen, setValue, location, language, lang]);

  return {
    handleSubmit,
    onSubmits,
    onSubmit,
    register,
    errors,
    variants,
    setVariants,
    addVariant,
    removeVariant,
    published,
    setPublished,
    isSubmitting,
    isLoading,
    handleSelectLanguage,
  };
};

export default useAttributeSubmit;
