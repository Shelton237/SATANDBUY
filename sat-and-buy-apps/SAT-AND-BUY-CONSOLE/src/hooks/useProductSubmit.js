import combinate from "combinate";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import swal from "sweetalert";

//internal import
import useAsync from "@/hooks/useAsync";
import { SidebarContext } from "@/context/SidebarContext";
import AttributeServices from "@/services/AttributeServices";
import ProductServices from "@/services/ProductServices";
import { notifyError, notifySuccess } from "@/utils/toast";
// import useTranslationValue from "./useTranslationValue";
import useUtilsFunction from "./useUtilsFunction";

const SERVICE_DETAILS_TEMPLATE = {
  deliveryMode: "onsite",
  durationValue: "",
  durationUnit: "hours",
  location: "",
  resources: "",
  notes: "",
  priceIncludes: "",
};

const normalizeTags = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((item) => !!item && item.toString().trim() !== "");
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => !!item && item.toString().trim() !== "");
      }
    } catch (err) {
      // ignore parsing error and fallback to split
    }
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");
  }

  return [];
};

const useProductSubmit = (id) => {
  const location = useLocation();
  const { isDrawerOpen, closeDrawer, setIsUpdate, lang } =
    useContext(SidebarContext);

  const { data: attribue } = useAsync(AttributeServices.getShowingAttributes);

  // react ref
  const resetRef = useRef([]);
  const resetRefTwo = useRef("");

  // react hook
  const [imageUrl, setImageUrl] = useState([]);
  const [tag, setTag] = useState([]);
  const [values, setValues] = useState({});
  let [variants, setVariants] = useState([]);
  const [variant, setVariant] = useState([]);
  const [totalStock, setTotalStock] = useState(0);
  const [quantity, setQuantity] = useState(0);

  const [originalPrice, setOriginalPrice] = useState(0);
  const [price, setPrice] = useState(0);
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [isBasicComplete, setIsBasicComplete] = useState(false);
  const [tapValue, setTapValue] = useState("Basic Info");
  const [isCombination, setIsCombination] = useState(false);
  const [attTitle, setAttTitle] = useState([]);
  const [variantTitle, setVariantTitle] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [productId, setProductId] = useState("");
  const [updatedId, setUpdatedId] = useState(id);
  const [imgId, setImgId] = useState("");
  const [isBulkUpdate, setIsBulkUpdate] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [defaultCategory, setDefaultCategory] = useState([]);
  const [resData, setResData] = useState({});
  const [language, setLanguage] = useState(lang);
  const [openModal, setOpenModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slug, setSlug] = useState("");
  const [productType, setProductType] = useState("physical");
  const [serviceDetails, setServiceDetails] = useState({
    ...SERVICE_DETAILS_TEMPLATE,
  });

  // const { handlerTextTranslateHandler } = useTranslationValue();
  const { showingTranslateValue, getNumber, getNumberTwo } = useUtilsFunction();

  const handleRemoveEmptyKey = (obj) => {
    for (const key in obj) {
      if (obj[key].trim() === "") {
        delete obj[key];
      }
    }
    // console.log("obj", obj);
    return obj;
  };

  // handle click
  const onCloseModal = () => setOpenModal(false);
  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm();

  const handleProductTypeChange = (nextType) => {
    setProductType(nextType);
    if (nextType === "service") {
      setIsCombination(false);
      setValue("stock", 0);
    }
  };

  const handleServiceDetailsChange = (field, value) => {
    setServiceDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const buildServicePayload = () => {
    if (productType !== "service") return null;
    const payload = {
      deliveryMode: serviceDetails.deliveryMode || "onsite",
      durationUnit: serviceDetails.durationUnit || "hours",
    };
    if (
      serviceDetails.durationValue !== "" &&
      serviceDetails.durationValue !== null &&
      typeof serviceDetails.durationValue !== "undefined"
    ) {
      const durationValue = Number(serviceDetails.durationValue);
      if (Number.isFinite(durationValue) && durationValue >= 0) {
        payload.durationValue = durationValue;
      }
    }

    ["location", "resources", "notes", "priceIncludes"].forEach((field) => {
      const value = serviceDetails[field];
      if (value && value.toString().trim() !== "") {
        payload[field] = value.toString().trim();
      }
    });

    return payload;
  };

  const onSubmit = async (data) => {
    // console.log('data is data',data)
    try {
      setIsSubmitting(true);
      if (!imageUrl) return notifyError("Image is required!");

      if (data.originalPrice < data.price) {
        setIsSubmitting(false);
        return notifyError(
          "Sale Price must be less then or equal of product price!"
        );
      }
      if (!defaultCategory[0]) {
        setIsSubmitting(false);
        return notifyError("Default Category is required!");
      }

      const updatedVariants = variants.map((v, i) => {
        const newObj = {
          ...v,
          price: getNumberTwo(v?.price),
          originalPrice: getNumberTwo(v?.originalPrice),
          discount: getNumberTwo(v?.discount),
          quantity: Number(v?.quantity || 0),
        };
        return newObj;
      });

      setIsBasicComplete(true);
      setPrice(data.price);
      setQuantity(data.stock);
      setBarcode(data.barcode);
      setSku(data.sku);
      setOriginalPrice(data.originalPrice);

      const isService = productType === "service";
      const servicePayload = isService ? buildServicePayload() : null;

      // const titleTranslates = await handlerTextTranslateHandler(
      //   data.title,
      //   language
      // );
      // const descriptionTranslates = await handlerTextTranslateHandler(
      //   data.description,
      //   language
      // );

      const productData = {
        productId: productId,
        sku: data.sku || "",
        barcode: data.barcode || "",
        title: handleRemoveEmptyKey({
          [language]: data.title,
          // ...titleTranslates,
        }),
        description: handleRemoveEmptyKey({
          [language]: data.description || "",
          // ...descriptionTranslates,
        }),
        slug: data.slug
          ? data.slug
          : data.title.toLowerCase().replace(/[^A-Z0-9]+/gi, "-"),

        categories: selectedCategory.map((item) => item.id || item._id),
        category: defaultCategory[0].id || defaultCategory[0]._id,

        image: imageUrl,
        stock: isService
          ? 0
          : variants?.length < 1
          ? data.stock
          : Number(totalStock),
        tag: tag,

        prices: {
          price: getNumber(data.price),
          originalPrice: getNumberTwo(data.originalPrice),
          discount: Number(data.originalPrice) - Number(data.price),
        },
        isCombination:
          isService || !updatedVariants?.length
            ? false
            : isCombination,
        variants: isCombination ? updatedVariants : [],
        type: productType,
        serviceDetails: servicePayload,
      };

      // console.log("productData ===========>", productData, "data", data);
      // return setIsSubmitting(false);

      if (updatedId) {
        const res = await ProductServices.updateProduct(updatedId, productData);
        if (res) {
          if (isCombination) {
            setIsUpdate(true);
            notifySuccess(res.message);
            setIsBasicComplete(true);
            setIsSubmitting(false);
            handleProductTap("Combination", true);
          } else {
            setIsUpdate(true);
            notifySuccess(res.message);
            setIsSubmitting(false);
          }
        }

        if (
          tapValue === "Combination" ||
          (tapValue !== "Combination" && !isCombination)
        ) {
          closeDrawer();
        }
      } else {
        const res = await ProductServices.addProduct(productData);
        // console.log("res is ", res);
        if (isCombination) {
          setUpdatedId(res.id || res._id);
          setValue("title", res.title[language ? language : "en"]);
          setValue("description", res.description[language ? language : "en"]);
          setValue("slug", res.slug);
          setValue("show", res.show);
          setValue("barcode", res.barcode);
          setValue("stock", res.stock);
          setTag(normalizeTags(res.tag));
          setImageUrl(res.image);
          setVariants(res.variants);
          setValue("productId", res.productId);
          setProductId(res.productId);
          setOriginalPrice(res?.prices?.originalPrice);
          setPrice(res?.prices?.price);
          setBarcode(res.barcode);
          setSku(res.sku);
          const result = res.variants.map(
            ({
              originalPrice,
              price,
              discount,
              quantity,
              barcode,
              sku,
              productId,
              image,
              ...rest
            }) => rest
          );

          setVariant(result);
          setIsUpdate(true);
          setIsBasicComplete(true);
          setIsSubmitting(false);
          handleProductTap("Combination", true);
          notifySuccess("Product Added Successfully!");
        } else {
          setIsUpdate(true);
          notifySuccess("Product Added Successfully!");
        }

        if (
          tapValue === "Combination" ||
          (tapValue !== "Combination" && !isCombination)
        ) {
          setIsSubmitting(false);
          closeDrawer();
        }
      }
    } catch (err) {
      // console.log("err", err);
      setIsSubmitting(false);
      notifyError(err?.response?.data?.message || err?.message);
      closeDrawer();
    }
  };

  useEffect(() => {
    if (!isDrawerOpen) {
      setSlug("");
      setLanguage(lang);
      setValue("language", language);
      handleProductTap("Basic Info", true);
      setResData({});
      setValue("sku");
      setValue("title");
      setValue("slug");
      setValue("description");
      setValue("quantity");
      setValue("stock");
      setValue("originalPrice");
      setValue("price");
      setValue("barcode");
      setValue("productId");
      setValue("stock", 0);

      setProductId("");
      // setValue('show');
      setImageUrl([]);
      setTag([]);
      setVariants([]);
      setVariant([]);
      setValues({});
      setTotalStock(0);
      setSelectedCategory([]);
      setDefaultCategory([]);
      if (location.pathname === "/products") {
        resetRefTwo?.current?.resetSelectedValues();
      }

      clearErrors("sku");
      clearErrors("title");
      clearErrors("slug");
      clearErrors("description");
      clearErrors("stock");
      clearErrors("quantity");
      setValue("stock", 0);
      setValue("costPrice", 0);
      setValue("price", 0);
      setValue("originalPrice", 0);
      clearErrors("show");
      clearErrors("barcode");
      setIsCombination(false);
      setIsBasicComplete(false);
      setIsSubmitting(false);
      setAttributes([]);
      setProductType("physical");
      setServiceDetails({ ...SERVICE_DETAILS_TEMPLATE });

      setUpdatedId();
      return;
    } else {
      handleProductTap("Basic Info", true);
    }

    if (id) {
      setIsBasicComplete(true);
      (async () => {
        try {
          const res = await ProductServices.getProductById(id);

          // console.log("res", res);

          if (res) {
            setResData(res);
            setSlug(res.slug);
            setUpdatedId(res.id || res._id);
            setValue("title", res.title[language ? language : "en"]);
            setValue(
              "description",
              res.description[language ? language : "en"]
            );
            setValue("slug", res.slug);
            setValue("show", res.show);
            setValue("sku", res.sku);
            setValue("barcode", res.barcode);
            setValue("stock", res.stock);
            setValue("productId", res.productId);
            setValue("price", res?.prices?.price);
            setValue("originalPrice", res?.prices?.originalPrice);
            setValue("stock", res.stock);
            setProductId(res.productId ? res.productId : res.id || res._id);
            setBarcode(res.barcode);
            setSku(res.sku);

            res.categories.map((category) => {
              category.name = showingTranslateValue(category?.name, lang);

              return category;
            });

            res.category.name = showingTranslateValue(
              res?.category?.name,
              lang
            );

            setSelectedCategory(res.categories);
            setDefaultCategory([res?.category]);
            setTag(normalizeTags(res.tag));
            setImageUrl(res.image);
            setVariants(res.variants);
            setQuantity(res?.stock);
            setTotalStock(res.stock);
            setOriginalPrice(res?.prices?.originalPrice);
            setPrice(res?.prices?.price);

            const resolvedType = res.type || "physical";
            setProductType(resolvedType);

            if (resolvedType === "service") {
              setServiceDetails({
                ...SERVICE_DETAILS_TEMPLATE,
                ...res.serviceDetails,
                durationValue:
                  typeof res?.serviceDetails?.durationValue === "number"
                    ? res.serviceDetails.durationValue.toString()
                    : res?.serviceDetails?.durationValue || "",
              });
              setIsCombination(false);
              setValue("stock", 0);
            } else {
              setServiceDetails({
                ...SERVICE_DETAILS_TEMPLATE,
              });
              setIsCombination(res.isCombination);
            }
          }
        } catch (err) {
          notifyError(err?.response?.data?.message || err?.message);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    id,
    setValue,
    isDrawerOpen,
    location.pathname,
    clearErrors,
    language,
    lang,
  ]);

  //for filter related attribute and extras for every product which need to update
  useEffect(() => {
    const result = attribue
      ?.filter((att) => att.option !== "Checkbox")
      .map((v) => {
        return {
          label: showingTranslateValue(v?.title, lang),
          value: showingTranslateValue(v?.title, lang),
        };
      });

    setAttTitle([...result]);

    const res = Object?.keys(Object.assign({}, ...variants));
    const varTitle = attribue?.filter((att) =>
      res.includes(att.id || att._id)
    );

    if (variants?.length > 0) {
      const totalStock = variants?.reduce((pre, acc) => pre + acc.quantity, 0);
      setTotalStock(Number(totalStock));
    }
    setVariantTitle(varTitle);
  }, [attribue, variants, language, lang]);

  //for adding attribute values
  const handleAddAtt = (v, el) => {
    const result = attribue.filter((att) => {
      const attribueTItle = showingTranslateValue(att?.title, lang);
      return v.some((item) => item.label === attribueTItle);
    });

    const attributeArray = result.map((value) => {
      const attributeTitle = showingTranslateValue(value?.title, lang);
      return {
        ...value,
        label: attributeTitle,
        value: attributeTitle,
      };
    });

    setAttributes(attributeArray);
  };

  //generate all combination combination
  const handleGenerateCombination = () => {
    if (Object.keys(values).length === 0) {
      return notifyError("Please select a variant first!");
    }

    const result = variants.filter(
      ({
        originalPrice,
        discount,
        price,
        quantity,
        barcode,
        sku,
        productId,
        image,
        ...rest
      }) => JSON.stringify({ ...rest }) !== "{}"
    );

    // console.log("result", result);

    setVariants(result);

    const combo = combinate(values);

    combo.map((com, i) => {
      if (JSON.stringify(variant).includes(JSON.stringify(com))) {
        return setVariant((pre) => [...pre, com]);
      } else {
        const newCom = {
          ...com,

          originalPrice: getNumberTwo(originalPrice),
          price: getNumber(price),
          quantity: Number(quantity),
          discount: Number(originalPrice - price),
          productId: productId && productId + "-" + (variants.length + i),
          barcode: barcode,
          sku: sku,
          image: imageUrl[0] || "",
        };

        setVariants((pre) => [...pre, newCom]);
        return setVariant((pre) => [...pre, com]);
      }
    });

    setValues({});

    // resetRef?.current?.map((v, i) =>
    //   resetRef?.current[i]?.resetSelectedValues()
    // );
  };

  //for clear selected combination
  const handleClearVariant = () => {
    setVariants([]);
    setVariant([]);
    setValues({});
    resetRef?.current?.map(
      async (v, i) => await resetRef?.current[i]?.resetSelectedValues()
    );

    // console.log('value', selectedList, removedItem, resetRef.current);
  };

  //for edit combination values
  const handleEditVariant = (variant) => {
    setTapValue("Combine");
  };

  //for remove combination values
  const handleRemoveVariant = (vari, ext) => {
    // console.log("handleRemoveVariant", vari, ext);
    swal({
      title: `Are you sure to delete this ${ext ? "Extra" : "combination"}!`,
      text: `(If Okay, It will be delete this ${
        ext ? "Extra" : "combination"
      })`,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        const result = variants.filter((v) => v !== vari);
        setVariants(result);
        // console.log("result", result);
        const {
          originalPrice,
          price,
          discount,
          quantity,
          barcode,
          sku,
          productId,
          image,
          ...rest
        } = vari;
        const res = variant.filter(
          (obj) => JSON.stringify(obj) !== JSON.stringify(rest)
        );
        setVariant(res);
        setIsBulkUpdate(true);
        // setTimeout(() => setIsBulkUpdate(false), 500);
        const timeOutId = setTimeout(() => setIsBulkUpdate(false), 500);
        return clearTimeout(timeOutId);
      }
    });
  };

  // handle notification for combination and extras
  const handleIsCombination = () => {
    if ((isCombination && variantTitle.length) > 0) {
      swal({
        title: "Are you sure to remove combination from this product!",
        text: "(It will be delete all your combination and extras)",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((value) => {
        // console.log(value);
        if (value) {
          setIsCombination(!isCombination);
          setTapValue("Basic Info");
          setVariants([]);
          setVariant([]);
        }
      });
    } else {
      setIsCombination(!isCombination);
      setTapValue("Basic Info");
    }
  };

  //for select bulk action images
  const handleSelectImage = (img) => {
    if (openModal) {
      variants[imgId].image = img;
      setOpenModal(false);
    }
  };

  //for select individual combination image
  const handleSelectInlineImage = (id) => {
    setImgId(id);
    setOpenModal(!openModal);
  };

  //this for variant/combination list
  const handleSkuBarcode = (value, name, id) => {
    variants[id][name] = value;
  };

  const handleProductTap = (e, value, name) => {
    // console.log(e);

    if (value) {
      if (!value)
        return notifyError(
          `${"Please save product before adding combinations!"}`
        );
    } else {
      if (!isBasicComplete)
        return notifyError(
          `${"Please save product before adding combinations!"}`
        );
    }
    setTapValue(e);
  };

  //this one for combination list
  const handleQuantityPrice = (value, name, id, variant) => {
    // console.log(
    //   "handleQuantityPrice",
    //   "name",
    //   name,
    //   "value",
    //   value,
    //   "variant",
    //   variant
    // );
    if (name === "originalPrice" && Number(value) < Number(variant.price)) {
      // variants[id][name] = Number(variant.originalPrice);
      notifyError("Price must be more then or equal of originalPrice!");
      setValue("originalPrice", variant.originalPrice);
      setIsBulkUpdate(true);
      const timeOutId = setTimeout(() => setIsBulkUpdate(false), 100);
      return () => clearTimeout(timeOutId);
    }
    if (name === "price" && Number(variant.originalPrice) < Number(value)) {
      // variants[id][name] = Number(variant.originalPrice);
      notifyError("Sale Price must be less then or equal of product price!");
      setValue("price", variant.originalPrice);
      setIsBulkUpdate(true);
      const timeOutId = setTimeout(() => setIsBulkUpdate(false), 100);
      return () => clearTimeout(timeOutId);
    }
    setVariants((pre) =>
      pre.map((com, i) => {
        if (i === id) {
          const updatedCom = {
            ...com,
            [name]: Math.round(value),
          };

          if (name === "price") {
            updatedCom.price = getNumberTwo(value);
            updatedCom.discount = Number(variant.originalPrice) - Number(value);
          }
          if (name === "originalPrice") {
            updatedCom.originalPrice = getNumberTwo(value);
            updatedCom.discount = Number(value) - Number(variant.price);
          }

          return updatedCom;
        }
        return com;
      })
    );

    const totalStock = variants.reduce(
      (pre, acc) => Number(pre) + Number(acc.quantity),
      0
    );
    setTotalStock(Number(totalStock));
  };

  //for change language in product drawer
  const handleSelectLanguage = (lang) => {
    setLanguage(lang);
    if (Object.keys(resData).length > 0) {
      setValue("title", resData.title[lang ? lang : "en"]);
      setValue("description", resData.description[lang ? lang : "en"]);
    }
  };

  //for handle product slug
  const handleProductSlug = (value) => {
    setValue("slug", value.toLowerCase().replace(/[^A-Z0-9]+/gi, "-"));
    setSlug(value.toLowerCase().replace(/[^A-Z0-9]+/gi, "-"));
  };

  return {
    tag,
    setTag,
    values,
    language,
    register,
    onSubmit,
    errors,
    slug,
    openModal,
    attribue,
    setValues,
    variants,
    imageUrl,
    setImageUrl,
    handleSubmit,
    isCombination,
    variantTitle,
    attributes,
    attTitle,
    handleAddAtt,
    productId,
    onCloseModal,
    isBulkUpdate,
    isSubmitting,
    tapValue,
    setTapValue,
    resetRefTwo,
    handleSkuBarcode,
    handleProductTap,
    selectedCategory,
    setSelectedCategory,
    setDefaultCategory,
    defaultCategory,
    handleProductSlug,
    handleSelectLanguage,
    handleIsCombination,
    handleEditVariant,
    handleRemoveVariant,
    handleClearVariant,
    handleQuantityPrice,
    handleSelectImage,
    handleSelectInlineImage,
    handleGenerateCombination,
    productType,
    serviceDetails,
    handleProductTypeChange,
    handleServiceDetailsChange,
  };
};

export default useProductSubmit;
