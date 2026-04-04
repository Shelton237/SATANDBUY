import Cookies from "js-cookie";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useCart } from "react-use-cart";
import useRazorpay from "react-razorpay";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";

//internal import
import { UserContext } from "@context/UserContext";
import { getUserSession } from "@lib/auth";
import OrderServices from "@services/OrderServices";
import CouponServices from "@services/CouponServices";
import { notifyError, notifySuccess } from "@utils/toast";
import CustomerServices from "@services/CustomerServices";
import NotificationServices from "@services/NotificationServices";
import ShippingRateServices from "@services/ShippingRateServices";

const useOptionalStripe = () => {
  try {
    return useStripe();
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Stripe n'est pas encore initialise :", err?.message);
    }
    return null;
  }
};

const useOptionalElements = () => {
  try {
    return useElements();
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Stripe Elements n'est pas disponible :", err?.message);
    }
    return null;
  }
};

const useCheckoutSubmit = (storeSetting) => {
  const router = useRouter();
  const { state, dispatch } = useContext(UserContext);
  const userInfo = state?.userInfo;

  const [error, setError] = useState("");
  const [total, setTotal] = useState("");
  const [couponInfo, setCouponInfo] = useState({});
  const [minimumAmount, setMinimumAmount] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [isCheckoutSubmit, setIsCheckoutSubmit] = useState(false);
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [useExistingAddress, setUseExistingAddress] = useState(false);
  const [hasPrefilledAddress, setHasPrefilledAddress] = useState(false);
  const [isCouponAvailable, setIsCouponAvailable] = useState(false);
  const [shippingData, setShippingData] = useState({
    data: null,
    loading: true,
    error: "",
  });
  
  // Locations states
  const [availableLocations, setAvailableLocations] = useState([]); // [{country, cities[]}]
  const [availableCountries, setAvailableCountries] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);

  const [shippingRates, setShippingRates] = useState([]);
  const [shippingRateLoading, setShippingRateLoading] = useState(false);
  const [selectedShippingRate, setSelectedShippingRate] = useState(null);

  const stripe = useOptionalStripe();
  const elements = useOptionalElements();
  const couponRef = useRef("");
  const [Razorpay] = useRazorpay();
  const { isEmpty, emptyCart, items, cartTotal } = useCart();

  const hasShippingAddress =
    !shippingData.loading &&
    shippingData?.data?.shippingAddress &&
    Object.keys(shippingData?.data?.shippingAddress)?.length > 0;
  const savedAddress = shippingData?.data?.shippingAddress || null;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      paymentMethod: "Cash",
    },
  });
  const watchedCountry = watch("country");
  const watchedCity = watch("city");

  useEffect(() => {
    if (Cookies.get("couponInfo")) {
      const coupon = JSON.parse(Cookies.get("couponInfo"));
      setCouponInfo(coupon);
      setDiscountPercentage(coupon.discountType);
      setMinimumAmount(coupon.minimumAmount);
    }
  }, [isCouponApplied]);

  // Load available locations from backoffice
  useEffect(() => {
    ShippingRateServices.getLocations()
      .then((locations) => {
        setAvailableLocations(locations);
        setAvailableCountries(locations.map((l) => l.country));
      })
      .catch((err) => {
        console.error("Failed to load locations", err);
      });
  }, []);

  // Update available cities when country changes
  useEffect(() => {
    if (watchedCountry) {
      const location = availableLocations.find(
        (l) => l.country.toLowerCase() === watchedCountry.toLowerCase()
      );
      setAvailableCities(location ? location.cities : []);
    } else {
      setAvailableCities([]);
    }
  }, [watchedCountry, availableLocations]);

  // Pre-fill user data (always email, and name if available and no saved address yet)
  useEffect(() => {
    if (userInfo?.email) {
      setValue("email", userInfo.email);
    }
    
    // If we have userInfo but NO saved address yet, pre-fill from profile
    if (userInfo?.name && !hasPrefilledAddress && !savedAddress) {
      const parts = (userInfo.name || "").trim().split(/\s+/);
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";
      
      setValue("firstName", firstName);
      setValue("lastName", lastName);
    }
  }, [userInfo, setValue, hasPrefilledAddress, savedAddress]);

  useEffect(() => {
    if (hasShippingAddress && !hasPrefilledAddress) {
      setUseExistingAddress(true);
      fillShippingForm(savedAddress);
      setHasPrefilledAddress(true);
    }
    if (!hasShippingAddress && hasPrefilledAddress) {
      setHasPrefilledAddress(false);
    }
  }, [hasShippingAddress, hasPrefilledAddress, savedAddress]);

  useEffect(() => {
    let cancelled = false;
    if (!userInfo?.id) {
      setShippingData({ data: null, loading: false, error: "" });
      return;
    }
    setShippingData((prev) => ({ ...prev, loading: true, error: "" }));
    (async () => {
      try {
        const res = await CustomerServices.getShippingAddress({
          userId: userInfo.id,
        });
        if (!cancelled) {
          setShippingData({ data: res, loading: false, error: "" });
        }
      } catch (err) {
        if (!cancelled) {
          setShippingData({
            data: null,
            loading: false,
            error: err?.message || "Impossible de charger l'adresse.",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userInfo?.id]);

  //remove coupon if total value less then minimum amount of coupon
  useEffect(() => {
    if (minimumAmount - discountAmount > total || isEmpty) {
      setDiscountPercentage(0);
      Cookies.remove("couponInfo");
    }
  }, [minimumAmount, total]);

  useEffect(() => {
    if (!watchedCountry) {
      setShippingRates([]);
      setSelectedShippingRate(null);
      setShippingCost(0);
      setShippingRateLoading(false);
      return;
    }

    let active = true;
    setShippingRateLoading(true);

    ShippingRateServices.getRates({
      country: watchedCountry,
      city: watchedCity,
    })
      .then((rates) => {
        if (!active) return;
        setShippingRates(rates);
        if (
          !rates.length ||
          (selectedShippingRate &&
            !rates.find((rate) => rate._id === selectedShippingRate?._id))
        ) {
          setSelectedShippingRate(null);
          setShippingCost(0);
        }
      })
      .catch(() => {
        if (!active) return;
        setShippingRates([]);
        setSelectedShippingRate(null);
        setShippingCost(0);
      })
      .finally(() => {
        if (active) setShippingRateLoading(false);
      });

    return () => {
      active = false;
    };
  }, [watchedCountry, watchedCity]);

  useEffect(() => {
    if (shippingRates.length && !selectedShippingRate) {
      handleShippingCost(shippingRates[0]);
    }
  }, [shippingRates, selectedShippingRate]);

  //calculate total and discount value
  useEffect(() => {
    const discountProductTotal = items?.reduce(
      (preValue, currentValue) => preValue + currentValue.itemTotal,
      0
    );

    let totalValue = 0;
    const subTotal = parseFloat(cartTotal + Number(shippingCost)).toFixed(2);
    const discountAmountTotal =
      discountPercentage?.type === "fixed"
        ? discountPercentage?.value
        : discountProductTotal * (discountPercentage?.value / 100);

    totalValue = Number(subTotal) - (discountAmountTotal || 0);

    setDiscountAmount(discountAmountTotal || 0);
    setTotal(totalValue);
  }, [cartTotal, shippingCost, discountPercentage]);

  useEffect(() => {
    if (userInfo === undefined) return;
    const session = userInfo || getUserSession();
    if (!session || !session.id) {
      router.replace("/auth/login?redirectUrl=%2Fcheckout");
    }
  }, [router, userInfo]);

  const submitHandler = async (data) => {
    try {
      if (!userInfo?.id) {
        notifyError("Veuillez vous connecter pour valider votre commande.");
        router.push("/auth/login?redirectUrl=%2Fcheckout");
        return;
      }

      setIsCheckoutSubmit(true);
      setError("");

      const userDetails = {
        name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
        contact: data.contact,
        email: data.email,
        address: data.address,
        country: data.country,
        city: data.city,
        zipCode: data.zipCode,
      };

      let orderInfo = {
        user_info: userDetails,
        shippingOption:
          selectedShippingRate?.label || data.shippingOption,
        paymentMethod: data.paymentMethod,
        status: "Pending",
        cart: items,
        subTotal: cartTotal,
        shippingCost: shippingCost,
        discount: discountAmount,
        total: total,
        shippingRate: selectedShippingRate
          ? {
              id: selectedShippingRate._id,
              label: selectedShippingRate.label,
              country: selectedShippingRate.country,
              city: selectedShippingRate.city,
              estimatedTime: selectedShippingRate.estimatedTime,
              description: selectedShippingRate.description,
            }
          : null,
      };

      await CustomerServices.addShippingAddress({
        userId: userInfo.id,
        shippingAddressData: {
          name: userDetails.name,
          contact: data.contact,
          email: userInfo?.email,
          address: data.address,
          country: data.country,
          city: data.city,
          zipCode: data.zipCode,
        },
      });

      if (data.paymentMethod === "Card") {
        if (!stripe || !elements) {
          notifyError("Stripe n'est pas prêt. Veuillez patienter.");
          setIsCheckoutSubmit(false);
          return;
        }

        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: "card",
          card: elements.getElement(CardElement),
        });

        if (error && !paymentMethod) {
          setError(error.message);
          setIsCheckoutSubmit(false);
          notifyError(error.message);
        } else {
          setError("");
          const orderData = {
            ...orderInfo,
            cardInfo: paymentMethod,
          };

          await handlePaymentWithStripe(orderData);
          return;
        }
      }
      if (data.paymentMethod === "RazorPay") {
        await handlePaymentWithRazorpay(orderInfo);
      }
      if (data.paymentMethod === "Cash") {
        const orderResponse = await OrderServices.addOrder(orderInfo);

        // notification info
        const notificationInfo = {
          orderId: orderResponse?._id,
          message: `${orderResponse?.user_info?.name}, Placed ${parseFloat(
            orderResponse?.total
          ).toFixed(2)} order!`,
          image:
            "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png",
        };
        // notification api call
        await NotificationServices.addNotification(notificationInfo);

        router.push(`/order/${orderResponse?._id}`);
        notifySuccess("Votre commande est confirmée !");
        Cookies.remove("couponInfo");

        emptyCart();
        setIsCheckoutSubmit(false);
      }
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
      setIsCheckoutSubmit(false);
    }
  };

  //handle stripe payment

  const handlePaymentWithStripe = async (order) => {
    try {
      const stripeInfo = await OrderServices.createPaymentIntent(order);
      stripe.confirmCardPayment(stripeInfo?.client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      const orderData = {
        ...order,
        cardInfo: stripeInfo,
      };
      const orderResponse = await OrderServices.addOrder(orderData);
      // notification info
      const notificationInfo = {
        orderId: orderResponse._id,
        message: `${orderResponse.user_info.name}, Placed ${parseFloat(
          orderResponse.total
        ).toFixed(2)} order!`,
        image:
          "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png",
      };
      // notification api call
      await NotificationServices.addNotification(notificationInfo);

      router.push(`/order/${orderResponse._id}`);
      notifySuccess("Votre commande est confirmée !");
      Cookies.remove("couponInfo");
      emptyCart();

      setIsCheckoutSubmit(false);
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
      setIsCheckoutSubmit(false);
    }
  };

  //handle razorpay payment
  const handlePaymentWithRazorpay = async (orderInfo) => {
    try {
      const { amount, id, currency } =
        await OrderServices.createOrderByRazorPay({
          amount: Math.round(total).toString(),
        });

      if ((amount, id, currency)) {
        const razorpayKey = storeSetting?.razorpay_id;

        const options = {
          key: razorpayKey,
          amount: amount,
          currency: currency,
          name: "Sat & Buy",
          description: "This is total cost of your purchase",
          order_id: id,
          handler: async function (response) {
            const razorpay = {
              amount: total,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            };

            const orderData = {
              ...orderInfo,
              total: total,
              razorpay,
            };

            const res = await OrderServices.addOrder(orderData);
            if (res) {
              router.push(`/order/${res._id}`);
              notifySuccess("Votre commande est confirmée !");
              Cookies.remove("couponInfo");
              emptyCart();

              await NotificationServices.addNotification({
                message: `${orderInfo?.user_info?.name} placed $${total} order!`,
                orderId: res._id,
              });
            }
          },

          modal: {
            ondismiss: function () {
              setIsCheckoutSubmit(false);
            },
          },

          prefill: {
            name: orderInfo?.user_info?.name,
            email: orderInfo?.user_info?.email,
            contact: orderInfo?.user_info?.contact,
          },
          theme: {
            color: "#10b981",
          },
        };

        const rzpay = new Razorpay(options);
        rzpay.open();
      }
    } catch (err) {
      setIsCheckoutSubmit(false);
      notifyError(err.message);
    }
  };

  function handleShippingCost(rate, updateField = true) {
    if (!rate) return;
    const costValue = Number(rate.cost ?? rate);
    if (rate?._id) {
      setSelectedShippingRate(rate);
    }
    setShippingCost(Number.isNaN(costValue) ? 0 : costValue);
    if (updateField && rate?.label) {
      setValue("shippingOption", rate.label);
    }
  }

  //handle default shipping address
  const fillShippingForm = (address) => {
    if (!address) return;
    const [firstName = "", ...rest] = (address.name || "").split(" ");
    const lastName = rest.join(" ");
    setValue("firstName", firstName);
    setValue("lastName", lastName);
    setValue("address", address.address);
    setValue("contact", address.contact);
    setValue("city", address.city);
    setValue("country", address.country);
    setValue("zipCode", address.zipCode);
  };

  const clearShippingForm = () => {
    setValue("firstName", "");
    setValue("lastName", "");
    setValue("address", "");
    setValue("contact", "");
    setValue("city", "");
    setValue("country", "");
    setValue("zipCode", "");
  };

  const handleDefaultShippingAddress = (value) => {
    setUseExistingAddress(value);
    if (value) {
      fillShippingForm(savedAddress);
    } else {
      clearShippingForm();
    }
  };
  const handleCouponCode = async (e) => {
    e.preventDefault();

    if (!couponRef.current.value) {
      notifyError("Veuillez entrer un code promo !");
      return;
    }
    setIsCouponAvailable(true);

    try {
      const coupons = await CouponServices.getShowingCoupons();
      const result = coupons.filter(
        (coupon) => coupon.couponCode === couponRef.current.value
      );
      setIsCouponAvailable(false);

      if (result.length < 1) {
        notifyError("Veuillez entrer un code de réduction valide !");
        return;
      }

      if (dayjs().isAfter(dayjs(result[0]?.endTime))) {
        notifyError("Ce code promo n'est pas valide !");
        return;
      }

      if (total < result[0]?.minimumAmount) {
        notifyError(
          `Minimum ${result[0].minimumAmount} ${result[0]?.currency || 'XAF'} requis pour ce coupon !`
        );
        return;
      } else {
        notifySuccess(
          `Votre coupon ${result[0].couponCode} a été appliqué !`
        );
        setIsCouponApplied(true);
        setMinimumAmount(result[0]?.minimumAmount);
        setDiscountPercentage(result[0].discountType);
        dispatch({ type: "SAVE_COUPON", payload: result[0] });
        Cookies.set("couponInfo", JSON.stringify(result[0]));
      }
    } catch (error) {
      return notifyError(error.message);
    }
  };

  return {
    register,
    errors,
    showCard,
    setShowCard,
    error,
    stripe,
    couponInfo,
    couponRef,
    total,
    isEmpty,
    items,
    cartTotal,
    handleSubmit,
    submitHandler,
    handleShippingCost,
    handleCouponCode,
    discountPercentage,
    discountAmount,
    shippingCost,
    shippingRates,
    shippingRateLoading,
    selectedShippingRate,
    isCheckoutSubmit,
    isCouponApplied,
    useExistingAddress,
    hasShippingAddress,
    isCouponAvailable,
    handleDefaultShippingAddress,
    availableCountries,
    availableCities,
    watch,
    setValue,
  };
};

export default useCheckoutSubmit;
