// components/drawer/StaffDrawer.jsx
import React, { useCallback } from "react";
import { Scrollbars } from "react-custom-scrollbars-2";
import { Card, CardBody, Input } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";

import Error from "@/components/form/others/Error";
import Title from "@/components/form/others/Title";
import InputArea from "@/components/form/input/InputArea";
import useStaffSubmit from "@/hooks/useStaffSubmit";
import SelectRole from "@/components/form/selectOption/SelectRole";
import DrawerButton from "@/components/form/button/DrawerButton";
import LabelArea from "@/components/form/selectOption/LabelArea";
import Uploader from "@/components/image-uploader/Uploader";

const StaffDrawer = ({ staffId, roles = [], onUserAdded, onUserUpdated }) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    onSubmit,
    errors,
    imageUrl,
    setImageUrl,
    isSubmitting,
    selectedDate,
    setSelectedDate,
    language,
    setLanguage,
    resData,
  } = useStaffSubmit(staffId);

  const isUpdate = Boolean(staffId);

  const roleOptions = roles.map((role) => ({
    value: role.name,
    label: role.description || role.name,
    original: role,
  }));

  const defaultRoleValue = (() => {
    const roleName = resData?.role || resData?.roles?.[0];
    if (!roleName) return "";
    return roleOptions.some((opt) => opt.value === roleName) ? roleName : "";
  })();

  const formFields = [
    {
      label: t("Username"),
      name: "username",
      type: "text",
      required: true,
      placeholder: t("UsernamePlaceholder"),
      defaultValue: resData?.username || ""
    },
    {
      label: t("FirstName"),
      name: "firstName",
      type: "text",
      required: true,
      placeholder: t("FirstNamePlaceholder"),
      defaultValue: resData?.firstName || ""
    },
    {
      label: t("LastName"),
      name: "lastName",
      type: "text",
      required: true,
      placeholder: t("LastNamePlaceholder"),
      defaultValue: resData?.lastName || ""
    },
    {
      label: t("Email"),
      name: "email",
      type: "email",
      required: true,
      placeholder: t("EmailPlaceholder"),
      defaultValue: resData?.email || ""
    },
    {
      label: t("Password"),
      name: "password",
      type: "password",
      required: !isUpdate,
      placeholder: t("PasswordPlaceholder")
    },
    {
      label: t("Phone"),
      name: "phone",
      type: "text",
      required: false,
      placeholder: t("PhonePlaceholder"),
      pattern: /^[+]?[0-9]*$/,
      defaultValue: resData?.phone || ""
    }
  ];

  const handleSelectLanguage = useCallback((lang) => setLanguage(lang), [setLanguage]);

  const handleFormSubmit = useCallback(async (data) => {
    try {
      // Appel à la fonction onSubmit existante
      const result = await onSubmit(data, roles);

      // Si vous avez besoin d'accéder à l'utilisateur créé/mis à jour,
      // vous devrez peut-être modifier useStaffSubmit pour le retourner
      if (result && result.user) {
        if (isUpdate) {
          onUserUpdated?.(result.user);
        } else {
          onUserAdded?.(result.user);
        }
      }

      return result;
    } catch (error) {
      throw error;
    }
  }, [onSubmit, roles, isUpdate, onUserAdded, onUserUpdated]);


  return (
    <>
      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        <Title
          register={register}
          handleSelectLanguage={handleSelectLanguage}
          title={isUpdate ? t("UpdateStaff") : t("AddStaffTitle")}
          description={isUpdate ? t("UpdateStaffdescription") : t("AddStaffdescription")}
          currentLanguage={language}
        />
      </div>

      <Scrollbars className="w-full md:w-7/12 lg:w-8/12 xl:w-8/12 relative dark:bg-gray-700 dark:text-gray-200">
        <Card className="overflow-y-scroll flex-grow scrollbar-hide w-full max-h-full">
          <CardBody>
            {/* <form onSubmit={handleSubmit(data => onSubmit(data, roles))}>
             */}
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <div className="px-6 pt-8 flex-grow scrollbar-hide w-full max-h-full pb-40">
                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                  <LabelArea label={t("StaffImage")} />
                  <div className="col-span-8 sm:col-span-4">
                    <Uploader imageUrl={imageUrl} setImageUrl={setImageUrl} folder="admin" />
                  </div>
                </div>

                {formFields.map((field) => (
                  <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6" key={field.name}>
                    <LabelArea label={field.label} />
                    <div className="col-span-8 sm:col-span-4">
                      <InputArea register={register} errors={errors} {...field} />
                      <Error errorName={errors[field.name]} />
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                  <LabelArea label={t("JoiningDate")} />
                  <div className="col-span-8 sm:col-span-4">
                    <Input
                      onChange={(e) => setSelectedDate(e.target.value)}
                      name="joiningDate"
                      value={selectedDate}
                      type="date"
                      placeholder={t("StaffJoiningDate")}
                    />
                    <Error errorName={errors.joiningDate} />
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                  <LabelArea label={t("StaffRole")} />
                  <div className="col-span-8 sm:col-span-4">
                    {roleOptions.length > 0 ? (
                      <SelectRole
                        register={register}
                        label={t("Role")}
                        name="role"
                        defaultValue={defaultRoleValue}
                        options={roleOptions}
                      />
                    ) : (
                      <div className="text-sm text-red-500 p-2 bg-red-50 rounded">
                        <p>Aucun rôle valide disponible</p>
                      </div>
                    )}
                    <Error errorName={errors.role} />
                  </div>
                </div>
              </div>

              <DrawerButton isUpdate={isUpdate} title="Staff" isSubmitting={isSubmitting} />
            </form>
          </CardBody>
        </Card>
      </Scrollbars>
    </>
  );
};

export default StaffDrawer;

