import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import CustomerServices from "@services/CustomerServices";
import { notifyError, notifySuccess } from "@utils/toast";
import { UserContext } from "@context/UserContext";
import { persistUserSession } from "@lib/auth";
import { useRouter } from "next/router";

const useSignupSubmit = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { dispatch } = useContext(UserContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submitHandler = async ({ name, email, password, confirmPassword }) => {
    if (password !== confirmPassword) {
      notifyError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      await CustomerServices.registerCustomerDirect({
        name,
        email,
        password,
      });
      const user = await CustomerServices.loginCustomer({ email, password });
      persistUserSession(user);
      dispatch({ type: "USER_LOGIN", payload: user });
      notifySuccess("Compte créé ! Bienvenue sur Sat&Buy.");
      router.push("/user/dashboard");
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

export default useSignupSubmit;
