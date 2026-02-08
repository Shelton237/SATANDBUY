// hooks/useStaffSubmit.js
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import { notifyError, notifySuccess } from "@/utils/toast";
import UserService from "@/services/UserService";
import AdminServices from "@/services/AdminServices";
import { STAFF_ROLE_VALUES } from "@/constants/roles";

const useStaffSubmit = (id) => {
  const [state, setState] = useState({
    imageUrl: "",
    selectedDate: dayjs().format("YYYY-MM-DD"),
    language: "en",
    resData: {},
    isSubmitting: false,
    availabilitySlots: [],
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const buildStaffPayload = useCallback(
    (data) => {
      const fullName = `${data.firstName || ""} ${data.lastName || ""}`.trim() || data.username;
      const safeRole = data.role || STAFF_ROLE_VALUES[0];
      return {
        name: { [state.language]: fullName },
        email: data.email,
        phone: data.phone || "",
        role: safeRole,
        joiningData: state.selectedDate,
        image: state.imageUrl,
        availabilitySlots: state.availabilitySlots || [],
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
        setState((s) => ({
          ...s,
          availabilitySlots: mappedUser.availabilitySlots || [],
        }));

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
      setValue("role", STAFF_ROLE_VALUES[0]);
      return;
    }
    try {
      const { data: user } = await UserService.getUserById(id);
      setState((s) => ({
        ...s,
        resData: user,
        selectedDate: dayjs(user.joiningDate || Date.now()).format("YYYY-MM-DD"),
        imageUrl: user.image || "",
        availabilitySlots: user.availabilitySlots || [],
      }));
      ["firstName", "lastName", "email", "phone", "username"].forEach((field) =>
        setValue(field, user[field] || "")
      );
      setValue("role", user.roles?.[0] || user.role || STAFF_ROLE_VALUES[0]);
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
    setValue,
    watch,
    setImageUrl: (url) => setState((s) => ({ ...s, imageUrl: url })),
    setSelectedDate: (date) => setState((s) => ({ ...s, selectedDate: date })),
    setLanguage: (lang) => setState((s) => ({ ...s, language: lang })),
    ...state,
    availabilitySlots: state.availabilitySlots,
    setAvailabilitySlots: (slotsUpdater) =>
      setState((s) => {
        const nextValue =
          typeof slotsUpdater === "function"
            ? slotsUpdater(s.availabilitySlots || [])
            : slotsUpdater || [];
        return { ...s, availabilitySlots: nextValue };
      }),
  };
};

export default useStaffSubmit;
