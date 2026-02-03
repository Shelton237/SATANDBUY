// hooks/useStaffSubmit.js
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import { notifyError, notifySuccess } from "@/utils/toast";
import UserService from "@/services/UserService";
import AuthService from "@/services/AuthService";

const useStaffSubmit = (id) => {
  const [state, setState] = useState({
    imageUrl: "",
    selectedDate: dayjs().format("YYYY-MM-DD"),
    language: "en",
    resData: {},
    isSubmitting: false,
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  // 🚀 Crée le payload user
  const buildUserData = (data) => ({
    username: data.username || data.email,
    email: data.email,
    enabled: true,
    firstName: data.firstName,
    lastName: data.lastName,
    attributes: {
      phone: [data.phone || ""],
      lang: [state.language],
      image: [state.imageUrl || ""],
      joiningDate: [state.selectedDate]
    },
    credentials: data.password ? [{
      type: "password",
      value: data.password,
      temporary: false
    }] : [],
  });

  const handleUser = useCallback(async (userId, data, token) => {
    return userId
      ? await UserService.updateUser(userId, data, token)
      : (await UserService.createUser(data, token)).data?.id;
  }, []);

  const onSubmit = useCallback(async (data) => {
    try {
      setState(s => ({ ...s, isSubmitting: true }));
      const token = AuthService.getAccessToken();
      const userData = buildUserData(data);
      const userId = await handleUser(id, userData, token);
      if (userId && data.role) {
        await UserService.assignUserRole(userId, data.role, token); // 🔥 Service unifié
      }
      // Récupérer les données complètes de l'utilisateur
      const { data: completeUser } = await UserService.getUserById(userId, token);

      notifySuccess(id ? "User updated" : "User created");
      
      return { success: true, user: completeUser };
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message || "Error occurred");
    } finally {
      setState(s => ({ ...s, isSubmitting: false }));
    }
  }, [id, state.language, state.imageUrl, state.selectedDate, handleUser]);

  const fetchUser = useCallback(async () => {
    if (!id) return;
    try {
      const token = AuthService.getAccessToken();
      const { data: user } = await UserService.getUserById(id, token);
      setState(s => ({ ...s, resData: user, selectedDate: dayjs(user.joiningDate).format("YYYY-MM-DD") }));
      ["firstName", "lastName", "email", "phone", "username"].forEach(field => setValue(field, user[field] || ""));
      setValue("role", user.roles?.[0] || "");
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
    }
  }, [id, setValue]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    setImageUrl: (url) => setState(s => ({ ...s, imageUrl: url })),
    setSelectedDate: (date) => setState(s => ({ ...s, selectedDate: date })),
    setLanguage: (lang) => setState(s => ({ ...s, language: lang })),
    ...state,
  };
};

export default useStaffSubmit;