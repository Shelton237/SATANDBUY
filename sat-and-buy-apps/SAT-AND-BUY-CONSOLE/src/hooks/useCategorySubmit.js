// hooks/useCategorySubmit.js
import { useForm } from "react-hook-form";
import { useState, useEffect, useContext } from "react";
import CategoryServices from "@/services/products/CategoryServices";
import { SidebarContext } from "@/context/SidebarContext";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useTranslation } from "react-i18next";

const useCategorySubmit = (id, data) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const { closeDrawer, setIsUpdate, lang } = useContext(SidebarContext);
  const { t } = useTranslation();
  
  const [imageUrl, setImageUrl] = useState("");
  const [published, setPublished] = useState(true);
  const [status, setStatus] = useState("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checked, setChecked] = useState(null);
  const [selectCategoryName, setSelectCategoryName] = useState("");
  const [language, setLanguage] = useState(lang || "en");
  const [translations, setTranslations] = useState({ name: {}, type: {} });

  useEffect(() => {
    if (id && data) {
      const category = data.find((cat) => cat.id === id);
      if (category) {
        setStatus(category.status || "ACTIVE");
        setPublished(category.status === "ACTIVE");
        setImageUrl(category.icon || "");

        if (category.parentId) {
          setChecked(Number(category.parentId));
        }

        if (category.name) {
          setTranslations((prev) => ({
            ...prev,
            name: { ...prev.name, ...category.name },
          }));
        }

        if (category.type) {
          setTranslations((prev) => ({
            ...prev,
            type: { ...prev.type, ...category.type },
          }));
        }
      }
    }
  }, [id, data]);

  const handleSelectLanguage = (langCode) => {
    setLanguage(langCode);
  };

  const handleInputChange = (field, lang, value) => {
    setTranslations((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }));
  };

  const handleRemoveEmptyTranslations = (obj) => {
    const cleaned = {};
    for (const lang in obj) {
      if (obj[lang]?.trim()) {
        cleaned[lang] = obj[lang];
      }
    }
    return cleaned;
  };

  const verifyForm = () => {
    if (!translations?.name?.fr || !translations?.name?.en) {
      notifyError(t("CategoryNameRequired"));
      return false;
    }

    if (!translations?.type?.fr || !translations?.type?.en) {
      notifyError(t("CategoryTypeRequired"));
      return false;
    }

    if (!imageUrl) {
      notifyError(t("CategoryIconRequired"));
      return false;
    }

    return true;
  };

  const onSubmit = async () => {
    if (!verifyForm()) {
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: handleRemoveEmptyTranslations(translations.name),
        type: handleRemoveEmptyTranslations(translations.type),
        status,
        icon: imageUrl,
        ...(checked && { parentId: Number(checked) }),
      };

      let res;
      if (id) {
        res = await CategoryServices.updateOne(id, payload);
        notifySuccess(t("CategoryUpdatedSuccess"));
      } else {
        res = await CategoryServices.addOne(payload);
        notifySuccess(t("CategoryCreatedSuccess"));
      }

      setIsUpdate(true);
      closeDrawer();
      resetForm();
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    reset();
    setImageUrl("");
    setPublished(true);
    setStatus("ACTIVE");
    setChecked(null);
    setSelectCategoryName("");
    setTranslations({ name: {}, type: {} });
    setLanguage(lang || "en");
  };

  return {
    register,
    handleSubmit,
    errors,
    imageUrl,
    setImageUrl,
    published,
    setPublished,
    checked,
    setChecked,
    selectCategoryName,
    setSelectCategoryName,
    handleSelectLanguage,
    translations,
    handleInputChange,
    language,
    isSubmitting,
    onSubmit,
    resetForm,
    status,
    setStatus,
  };
};

export default useCategorySubmit;