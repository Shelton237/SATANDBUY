import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

//internal import
import { SidebarContext } from "@/context/SidebarContext";
import AttributeServices from "@/services/AttributeServices";
import { notifyError, notifySuccess } from "@/utils/toast";
import useToggleDrawer from "@/hooks/useToggleDrawer";

const getTranslationValue = (value, lang) => {
  if (!value) return "";
  if (typeof value === "object") {
    return value[lang] || value.en || Object.values(value)[0] || "";
  }
  return value;
};

const mergeTranslationValue = (existing, lang, nextValue) => {
  if (!nextValue) return existing || {};
  const base =
    typeof existing === "object" && existing !== null ? existing : {};
  return {
    ...base,
    [lang]: nextValue,
  };
};

const derivePublished = (status) => {
  const normalized = status?.toString().toLowerCase();
  return normalized !== "hide" && normalized !== "inactive";
};

const useAttributeSubmit = (id, attributeId) => {
  const { isDrawerOpen, closeDrawer, setIsUpdate, lang } =
    useContext(SidebarContext);
  const [language, setLanguage] = useState(lang || "en");
  const [variants, setVariants] = useState([]);
  const [published, setPublished] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAttribute, setCurrentAttribute] = useState(null);
  const [currentVariant, setCurrentVariant] = useState(null);

  const isChildMode = Boolean(attributeId);
  const variantId = id;

  const { setServiceId } = useToggleDrawer();

  const {
    handleSubmit,
    register,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm();

  const resetForm = () => {
    setValue("title");
    setValue("name");
    setValue("option");
    setValue("hexCode");
    setValue("description");
    setValue("logoUrl");
    clearErrors("title");
    clearErrors("name");
    clearErrors("option");
    clearErrors("hexCode");
    clearErrors("description");
    clearErrors("logoUrl");
    setPublished(true);
    setCurrentAttribute(null);
    setCurrentVariant(null);
  };

  const closeAndReset = () => {
    closeDrawer();
    setServiceId();
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      if (isChildMode) {
        if (!attributeId) {
          throw new Error("Identifiant d'attribut manquant");
        }
        const payload = {
          name: typeof data.name === "object"
            ? data.name
            : { [language]: data.name },
          hexCode: data.hexCode,
          description: data.description,
          logoUrl: data.logoUrl,
          status: published ? "show" : "hide",
        };

        if (variantId) {
          await AttributeServices.update(
            { ids: attributeId, id: variantId },
            payload
          );
          notifySuccess("Valeur d'attribut mise à jour");
        } else {
          await AttributeServices.addChildAttribute(attributeId, payload);
          notifySuccess("Valeur d'attribut créée");
        }
      } else {
        const payload = {
          title: mergeTranslationValue(
            currentAttribute?.title,
            language,
            data.title
          ),
          name: mergeTranslationValue(
            currentAttribute?.name,
            language,
            data.name
          ),
          option: data.option,
          status: published ? "ACTIVE" : "INACTIVE",
        };

        if (variantId) {
          await AttributeServices.update(variantId, payload);
          notifySuccess("Attribut mis à jour");
        } else {
          await AttributeServices.create(payload);
          notifySuccess("Attribut créé");
        }
      }
      setIsUpdate(true);
      closeAndReset();
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
      closeAndReset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectLanguage = (langCode) => {
    setLanguage(langCode);
    if (!isChildMode && currentAttribute) {
      setValue("title", getTranslationValue(currentAttribute.title, langCode));
      setValue("name", getTranslationValue(currentAttribute.name, langCode));
    }
    if (isChildMode && currentVariant) {
      setValue("name", getTranslationValue(currentVariant.name, langCode));
    }
  };

  const addVariant = (event) => {
    event.preventDefault();
    const value = event.target.value;
    if (!value) return;
    setVariants((prev) => [...prev, value]);
    event.target.value = "";
  };

  const removeVariant = (indexToRemove) => {
    setVariants((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  useEffect(() => {
    if (!isDrawerOpen) {
      resetForm();
      return;
    }

    const fetchData = async () => {
      if (!variantId && !isChildMode) return;
      setIsLoading(true);
      try {
        if (isChildMode) {
          if (!attributeId) return;
          const attribute = await AttributeServices.getById(attributeId);
          setCurrentAttribute(attribute);
          if (variantId) {
            const variant =
              attribute?.variants?.find(
                (item) => (item.id || item._id) === variantId
              ) || null;
            setCurrentVariant(variant);
            setPublished(derivePublished(variant?.status || variant?.rawStatus));
            setValue("name", getTranslationValue(variant?.name, language));
            setValue("hexCode", variant?.hexCode || "");
            setValue("description", variant?.description || "");
            setValue("logoUrl", variant?.logoUrl || "");
          } else {
            setValue("hexCode", "");
            setValue("description", "");
            setValue("logoUrl", "");
            setValue("name", "");
            setPublished(true);
          }
        } else if (variantId) {
          const attribute = await AttributeServices.getById(variantId);
          setCurrentAttribute(attribute);
          setPublished(derivePublished(attribute?.status || attribute?.rawStatus));
          setValue("title", getTranslationValue(attribute?.title, language));
          setValue("name", getTranslationValue(attribute?.name, language));
          setValue("option", attribute?.option || "");
        }
      } catch (error) {
        notifyError(error?.response?.data?.message || error?.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [attributeId, variantId, isChildMode, isDrawerOpen, language]);

  return {
    handleSubmit,
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
