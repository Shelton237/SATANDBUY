import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";


//internal import

import { notifyError, notifySuccess } from "@utils/toast";
import CustomerServices from "@services/CustomerServices";
import { UserContext } from "@context/UserContext";
import { persistUserSession } from "@lib/auth";

const useLoginSubmit = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { redirectUrl } = router.query;
  const { dispatch } = useContext(UserContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submitHandler = async ({ email, password }) => {
    setLoading(true);
    try {
      const user = await CustomerServices.loginCustomer({ email, password });
      const normalizedUser =
        user && !user.id && user._id ? { ...user, id: user._id } : user;
      persistUserSession(normalizedUser);
      dispatch({ type: "USER_LOGIN", payload: normalizedUser });
      notifySuccess("Connexion réussie !");
      const url = redirectUrl
        ? decodeURIComponent(redirectUrl)
        : "/user/dashboard";
      if (typeof window !== "undefined") {
        window.location.assign(url);
      } else {
        router.push(url);
      }
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    errors,
    loading,
    handleSubmit,
    submitHandler,
  };
};

export default useLoginSubmit;

