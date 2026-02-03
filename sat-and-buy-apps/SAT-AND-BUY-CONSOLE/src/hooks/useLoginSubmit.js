import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";

// internal imports
import { AdminContext } from "@/context/AdminContext";
import AuthService from "@/services/AuthService";
import { notifyError, notifySuccess } from "@/utils/toast";
import { removeSetting } from "@/reduxStore/slice/settingSlice";
import { loginSuccess } from "@/reduxStore/slice/authSlice"; // Import your auth action

const useLoginSubmit = () => {
  const reduxDispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { dispatch: adminDispatch } = useContext(AdminContext); // Renamed for clarity
  const history = useHistory();
  const location = useLocation();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleAuthSuccess = (authData) => {
    notifySuccess(location.pathname === "/login" ? "Login Success!" : "Register Success!");
    
    // Dispatch to Redux
    reduxDispatch(loginSuccess({
      user: authData.user,
      token: authData.token
    }));
    
    // Dispatch to AdminContext if still needed
    if (adminDispatch) {
      adminDispatch({
        type: "USER_LOGIN",
        payload: authData
      });
    }
    
    history.replace("/");
  };

  const onSubmit = async ({ name, email, verifyEmail, password, role }) => {
    setLoading(true);
    
    try {
      if (location.pathname === "/login") {
        reduxDispatch(removeSetting("globalSetting"));
        const authData = await AuthService.login(email, password);
        handleAuthSuccess(authData);
      }

      if (location.pathname === "/signup") {
        const authData = await AuthService.registerAndLogin({ name, email, password, role });
        handleAuthSuccess(authData);
      }

      if (location.pathname === "/forgot-password") {
        await AuthService.forgotPassword(verifyEmail);
        notifySuccess("Password reset instructions sent to your email");
      }
    } catch (err) {
      notifyError(err.message || err.response?.data?.message || "Authentication failed. Please try again.");
      console.error("Authentication error:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    onSubmit,
    register,
    handleSubmit,
    errors,
    loading,
  };
};

export default useLoginSubmit;