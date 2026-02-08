import Cookies from "js-cookie";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useCart } from "react-use-cart";
import useRazorpay from "react-razorpay";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";

//internal import
import { UserContext } from "@context/UserContext";
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
  } = useForm();
  const watchedCountry = watch("country");
  const watchedCity = watch("city");

  useEffect(() => {
    if (Cookies.get("couponInfo")) {
      const coupon = JSON.parse(Cookies.get("couponInfo"));
      // console.log('coupon information',coupon)
      setCouponInfo(coupon);
      setDiscountPercentage(coupon.discountType);
      setMinimumAmount(coupon.minimumAmount);
    }
    setValue("email", userInfo?.email);
  }, [isCouponApplied, userInfo?.email, setValue]);

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
  //calculate total and discount value
  useEffect(() => {
    const discountProductTotal = items?.reduce(
      (preValue, currentValue) => preValue + currentValue.itemTotal,
      0
    );

    let totalValue = 0;
    const subTotal = parseFloat(cartTotal + Number(shippingCost)).toFixed(2);
    const discountAmount =
      discountPercentage?.type === "fixed"
        ? discountPercentage?.value
        : discountProductTotal * (discountPercentage?.value / 100);

    const discountAmountTotal = discountAmount ? discountAmount : 0;

    totalValue = Number(subTotal) - discountAmountTotal;

    setDiscountAmount(discountAmountTotal);

    // console.log("total", totalValue);

    setTotal(totalValue);
  }, [cartTotal, shippingCost, discountPercentage]);

  useEffect(() => {
    if (!userInfo?.email) return;
    setValue("email", userInfo.email);
  }, [setValue, userInfo?.email]);

  useEffect(() => {
    if (userInfo === undefined) return;
    if (!userInfo?.id) {
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
        name: `${data.firstName} ${data.lastName}`,
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
          name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
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
          return;
        }

        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: "card",
          card: elements.getElement(CardElement),
        });

        // console.log('error', error);

        if (error && !paymentMethod) {
          setError(error.message);
          setIsCheckoutSubmit(false);
        } else {
          setError("");
          const orderData = {
            ...orderInfo,
            cardInfo: paymentMethod,
          };

          await handlePaymentWithStripe(orderData);

          // console.log('cardInfo', orderData);
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
        notifySuccess("Your Order Confirmed!");
        Cookies.remove("couponInfo");

        emptyCart();
        setIsCheckoutSubmit(false);
      }
    } catch (err) {
      notifyError(err ? err?.response?.data?.message : err?.message);
      setIsCheckoutSubmit(false);
    }
  };

  //handle stripe payment

  const handlePaymentWithStripe = async (order) => {
    try {
      // console.log('try goes here!', order);
      // const updatedOrder = {
      //   ...order,
      //   currency: 'usd',
      // };
      const stripeInfo = await OrderServices.createPaymentIntent(order);
      // console.log("res", stripeInfo, "order", order);
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
      console.log("orderResponse", orderResponse);
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
      notifySuccess("Your Order Confirmed!");
      Cookies.remove("couponInfo");
      emptyCart();

      setIsCheckoutSubmit(false);
    } catch (err) {
      // console.log("err", err?.message);
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

      // console.log("amount:::", amount);
      // setIsCheckoutSubmit(false);

      if ((amount, id, currency)) {
        const razorpayKey = storeSetting?.razorpay_id;

        // console.log("razorpayKey", razorpayKey);

        const options = {
          key: razorpayKey,
          amount: amount,
          currency: currency,
          name: "Fably Store",
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
              cardCharge: cardCharge,
              razorpay,
            };

            const res = await OrderServices.addRazorpayOrder(orderData);
            if (res) {
              router.push(`/order/${res._id}`);
              notifySuccess("Your Order Confirmed!");
              Cookies.remove("couponInfo");
              localStorage.removeItem("products");
              emptyCart();

              await NotificationServices.addNotification({
                message: `${data?.firstName} placed $${total} order!`,
                orderId: res._id,
                image: userInfo?.image,
              });
              socket.emit("notification", {
                message: `${data.firstName} placed $${total} order!`,
                orderId: res._id,
                image: userInfo?.image,
              });
            }
          },

          modal: {
            ondismiss: function () {
              setTotal(total);
              setIsCheckoutSubmit(false);
              console.log("Checkout form closed!");
            },
          },

          prefill: {
            name: "Alamgir",
            email: "alamgirh389@example.com",
            contact: "01957434434",
          },
          notes: {
            address: "Mumbai, India",
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
    // console.log("handle default shipping", value);
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
      notifyError("Please Input a Coupon Code!");
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
        notifyError("Please Input a Valid Coupon!");
        return;
      }

      if (dayjs().isAfter(dayjs(result[0]?.endTime))) {
        notifyError("This coupon is not valid!");
        return;
      }

      if (total < result[0]?.minimumAmount) {
        notifyError(
          `Minimum ${result[0].minimumAmount} USD required for Apply this coupon!`
        );
        return;
      } else {
        notifySuccess(
          `Your Coupon ${result[0].couponCode} is Applied on ${result[0].productType}!`
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
  };
};

export default useCheckoutSubmit;
