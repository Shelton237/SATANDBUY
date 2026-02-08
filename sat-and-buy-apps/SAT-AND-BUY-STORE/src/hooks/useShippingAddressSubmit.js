import { notifyError, notifySuccess } from "@utils/toast";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

//internal import
import { UserContext } from "@context/UserContext";
import { countries } from "@utils/countries";
import CustomerServices from "@services/CustomerServices";

const DEFAULT_COUNTRY = "Cameroon";

const useShippingAddressSubmit = (id) => {
  const router = useRouter();
  const { state } = useContext(UserContext);
  const userInfo = state?.userInfo;
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedValue, setSelectedValue] = useState({
    country: "",
    city: "",
    area: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const { handlerTextTranslateHandler } = useTranslationValue();

  const {
    register,
    handleSubmit,
    setValue,
    // clearErrors,
    // reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (userInfo === undefined) return;
    if (!userInfo?.id) {
      notifyError("Vous devez être connecté pour gérer vos adresses.");
      router.push("/auth/login?redirectUrl=%2Fuser%2Fadd-shipping-address");
    }
  }, [router, userInfo]);

  const onSubmit = async (data) => {
    if (
      !selectedValue?.country ||
      !selectedValue?.city ||
      !selectedValue?.area
    ) {
      return notifyError("Country, city and area is required!");
    }
    if (!userInfo?.id) {
      notifyError("Veuillez vous connecter pour ajouter une adresse.");
      router.push("/auth/login?redirectUrl=%2Fuser%2Fadd-shipping-address");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await CustomerServices.addShippingAddress({
        userId: userInfo.id,
        shippingAddressData: {
          ...data,
          country: selectedValue.country,
          city: selectedValue.city,
          area: selectedValue.area,
        },
      });

      notifySuccess(res.message);
      setIsSubmitting(false);
      router.push("/user/my-account");

      // console.log("onSubmit", data);
    } catch (err) {
      setIsSubmitting(false);
      notifyError(err ? err?.response?.data?.message : err?.message);
    }
  };

  const handleInputChange = (name, value) => {
    setSelectedValue((prevState) => {
      if (name === "country") {
        const countryMatch = countries?.find(
          (country) => country?.name === value
        );
        const nextCities = countryMatch?.cities || [];
        const firstCity = nextCities[0]?.name || "";
        const firstArea = nextCities[0]?.areas?.[0] || "";
        setCities(nextCities);
        setAreas(nextCities[0]?.areas || []);
        setValue("country", value);
        setValue("city", firstCity);
        setValue("area", firstArea);
        return {
          country: value,
          city: firstCity,
          area: firstArea,
        };
      }
      if (name === "city") {
        const cityMatch = cities?.find((city) => city?.name === value);
        const nextAreas = cityMatch?.areas || [];
        const firstArea = nextAreas[0] || "";
        setAreas(nextAreas);
        setValue("city", value);
        setValue("area", firstArea);
        return {
          ...prevState,
          city: value,
          area: firstArea,
        };
      }
      setValue(name, value);
      return {
        ...prevState,
        [name]: value,
      };
    });

    if (name === "area") {
      setValue("area", value);
    }
  };

  useEffect(() => {
    if (!userInfo?.id) return;
    if (id) {
      (async () => {
        try {
          const { shippingAddress } = await CustomerServices.getShippingAddress(
            {
              userId: userInfo.id,
            }
          );
          if (shippingAddress) {
            setValue("name", shippingAddress.name);
            setValue("address", shippingAddress.address);
            setValue("contact", shippingAddress.contact);
            setValue("email", shippingAddress.email || userInfo?.email);
            setValue("country", shippingAddress.country);
            setValue("city", shippingAddress.city);
            setValue("area", shippingAddress.area);
            setValue("zipCode", shippingAddress.zipCode);
            setSelectedValue({
              country: shippingAddress.country,
              city: shippingAddress.city,
              area: shippingAddress.area,
            });

            const matchedCountry = countries.find(
              (country) => country.name === shippingAddress.country
            );
            setCities(matchedCountry?.cities || []);

            const matchedCity = matchedCountry?.cities?.find(
              (city) => city.name === shippingAddress.city
            );
            setAreas(matchedCity?.areas || []);
          }
        } catch (err) {
          notifyError(err?.response?.data?.message || err?.message);
        }
      })();
    } else {
      setValue("email", userInfo?.email || "");
    }
  }, [id, setValue, userInfo?.email, userInfo?.id]);

  useEffect(() => {
    if (id) return;
    const defaultCountry =
      countries.find((country) => country.name === DEFAULT_COUNTRY) ||
      countries[0];

    if (defaultCountry) {
      const firstCity = defaultCountry.cities?.[0]?.name || "";
      const firstArea = defaultCountry.cities?.[0]?.areas?.[0] || "";
      setSelectedValue({
        country: defaultCountry.name,
        city: firstCity,
        area: firstArea,
      });
      setCities(defaultCountry.cities || []);
      setAreas(defaultCountry.cities?.[0]?.areas || []);
      setValue("country", defaultCountry.name);
      setValue("city", firstCity);
      setValue("area", firstArea);
    }
  }, [id, setValue]);

  return {
    register,
    onSubmit,
    errors,
    cities,
    areas,
    setValue,
    handleSubmit,
    selectedValue,
    isSubmitting,
    handleInputChange,
  };
};

export default useShippingAddressSubmit;
