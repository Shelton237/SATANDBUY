import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";

//internal import

import { notifyError, notifySuccess } from "@utils/toast";
import CustomerServices from "@services/CustomerServices";
import { UserContext } from "@context/UserContext";
import { persistUserSession } from "@lib/auth";

const useLoginSubmit = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const redirectUrl = useSearchParams().get("redirectUrl");
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
      persistUserSession(user);
      dispatch({ type: "USER_LOGIN", payload: user });
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

