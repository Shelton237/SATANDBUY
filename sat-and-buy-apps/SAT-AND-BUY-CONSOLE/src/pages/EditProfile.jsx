import React, { useContext } from "react";
import { Button } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";

//internal import
import { AdminContext } from "@/context/AdminContext";
import useStaffSubmit from "@/hooks/useStaffSubmit";
import PageTitle from "@/components/common/PageTitle";
import LabelArea from "@/components/form/selectOption/LabelArea";
import Uploader from "@/components/image-uploader/Uploader";
import InputArea from "@/components/form/input/InputArea";
import Error from "@/components/form/others/Error";
import SelectRole from "@/components/form/selectOption/SelectRole";
import AnimatedContent from "@/components/common/AnimatedContent";

const EditProfile = () => {
  const { t } = useTranslation();
  const { authData } = useContext(AdminContext);
  const adminId =
    authData?.user?.id ||
    authData?.user?._id ||
    authData?._id ||
    authData?.id ||
    null;

  const { register, handleSubmit, onSubmit, errors, imageUrl, setImageUrl } =
    useStaffSubmit(adminId);

  const isLoading = !adminId;

  return (
    <>
      <PageTitle> {t("EditProfile")} </PageTitle>
      <AnimatedContent>
        {isLoading ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-300">
            {t("Loading")}
          </div>
        ) : (
        <div className="container p-6 mx-auto bg-white  dark:bg-gray-800 dark:text-gray-200 rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6 flex-grow scrollbar-hide w-full max-h-full">
              <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                <LabelArea label={t("ProfilePicture")} />
                <div className="col-span-8 sm:col-span-4">
                  <Uploader
                    imageUrl={imageUrl || authData?.user?.image || []}
                    setImageUrl={setImageUrl}
                    folder="customer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                <LabelArea label={t("ProfileName")} />
                <div className="col-span-8 sm:col-span-4">
                  <InputArea
                    required={true}
                    register={register}
                    label="Name"
                    name="name"
                    type="text"
                    defaultValue={authData?.user?.name || ""}
                    placeholder="Your Name"
                  />
                  <Error errorName={errors.name} />
                </div>
              </div>

              <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                <LabelArea label={t("ProfileEmail")} />
                <div className="col-span-8 sm:col-span-4">
                  <InputArea
                    required={true}
                    register={register}
                    label="Email"
                    name="email"
                    type="text"
                    defaultValue={authData?.user?.email || ""}
                    placeholder="Email"
                  />
                  <Error errorName={errors.email} />
                </div>
              </div>

              <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                <LabelArea label={t("ProfileContactNumber")} />
                <div className="col-span-8 sm:col-span-4">
                  <InputArea
                    required={true}
                    register={register}
                    label="Contact Number"
                    name="phone"
                    type="text"
                    defaultValue={authData?.user?.phone || ""}
                    placeholder="Contact Number"
                  />
                  <Error errorName={errors.phone} />
                </div>
              </div>

              <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
                <LabelArea label={t("ProfileYourRole")} />
                <div className="col-span-8 sm:col-span-4">
                  <SelectRole
                    register={register}
                    label="Role"
                    name="role"
                    defaultValue={authData?.user?.role}
                  />
                  <Error errorName={errors.role} />
                </div>
              </div>
            </div>

            <div className="flex flex-row-reverse pr-6 pb-6">
              <Button type="submit" className="h-12 px-6">
                {t("updateProfile")}
              </Button>
            </div>
          </form>
        </div>
        )}
      </AnimatedContent>
    </>
  );
};

export default EditProfile;
