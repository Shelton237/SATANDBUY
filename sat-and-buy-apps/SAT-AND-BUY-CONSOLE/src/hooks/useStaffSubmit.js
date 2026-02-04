// hooks/useStaffSubmit.js
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import { notifyError, notifySuccess } from "@/utils/toast";
import UserService from "@/services/UserService";
import AdminServices from "@/services/AdminServices";

const useStaffSubmit = (id) => {
  const [state, setState] = useState({
    imageUrl: "",
    selectedDate: dayjs().format("YYYY-MM-DD"),
    language: "en",
    resData: {},
    isSubmitting: false,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const buildStaffPayload = useCallback(
    (data) => {
      const fullName = `${data.firstName || ""} ${data.lastName || ""}`.trim() || data.username;
      return {
        name: { [state.language]: fullName },
        email: data.email,
        phone: data.phone || "",
        role: data.role,
        joiningData: state.selectedDate,
        image: state.imageUrl,
        ...(data.password ? { password: data.password } : {}),
      };
    },
    [state.language, state.selectedDate, state.imageUrl]
  );

  const onSubmit = useCallback(
    async (data) => {
      try {
        setState((s) => ({ ...s, isSubmitting: true }));
        const payload = buildStaffPayload(data);

        const response = id
          ? await AdminServices.updateStaff(id, payload)
          : await AdminServices.addStaff(payload);

        const staff = response.data?.staff || response.data;
        const mappedUser = UserService.mapAdminToUser(staff);

        notifySuccess(id ? "Staff updated successfully" : "Staff created successfully");
        return { success: true, user: mappedUser };
      } catch (err) {
        notifyError(err?.response?.data?.message || err?.message || "Error occurred");
        throw err;
      } finally {
        setState((s) => ({ ...s, isSubmitting: false }));
      }
    },
    [id, buildStaffPayload]
  );

  const fetchUser = useCallback(async () => {
    if (!id) {
      setState((s) => ({ ...s, resData: {} }));
      return;
    }
    try {
      const { data: user } = await UserService.getUserById(id);
      setState((s) => ({
        ...s,
        resData: user,
        selectedDate: dayjs(user.joiningDate || Date.now()).format("YYYY-MM-DD"),
        imageUrl: user.image || "",
      }));
      ["firstName", "lastName", "email", "phone", "username"].forEach((field) =>
        setValue(field, user[field] || "")
      );
      setValue("role", user.roles?.[0] || user.role || "");
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
    }
  }, [id, setValue]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    setImageUrl: (url) => setState((s) => ({ ...s, imageUrl: url })),
    setSelectedDate: (date) => setState((s) => ({ ...s, selectedDate: date })),
    setLanguage: (lang) => setState((s) => ({ ...s, language: lang })),
    ...state,
  };
};

export default useStaffSubmit;
