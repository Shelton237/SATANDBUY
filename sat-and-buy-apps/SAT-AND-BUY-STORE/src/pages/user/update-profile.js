import { useForm } from "react-hook-form";
import React, { useContext, useEffect, useState } from "react";

//internal import
import Label from "@components/form/Label";
import Error from "@components/form/Error";
import Dashboard from "@pages/user/dashboard";
import InputArea from "@components/form/InputArea";
import useGetSetting from "@hooks/useGetSetting";
import CustomerServices from "@services/CustomerServices";
import Uploader from "@components/image-uploader/Uploader";
import { notifySuccess, notifyError } from "@utils/toast";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { UserContext } from "@context/UserContext";
import { persistUserSession } from "@lib/auth";

const UpdateProfile = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { state, dispatch } = useContext(UserContext);

  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    // return notifySuccess("This Feature is disabled for demo!");

    setLoading(true);

    const userData = {
      name: data.name,
      email: data.email,
      address: data.address,
      phone: data.phone,
      image: imageUrl,
    };
    try {
      const res = await CustomerServices.updateCustomer(
        state?.userInfo?._id,
        userData
      );
      setLoading(false);
      persistUserSession(res);
      dispatch({ type: "USER_LOGIN", payload: res });
      notifySuccess("Profile Update Successfully!");
    } catch (error) {
      setLoading(false);
      notifyError(error?.response?.data?.message || error?.message);
    }
  };

  useEffect(() => {
    if (state?.userInfo) {
      setValue("name", state.userInfo.name);
      setValue("email", state.userInfo.email);
      setValue("address", state.userInfo.address);
      setValue("phone", state.userInfo.phone);
      setImageUrl(state.userInfo.image);
    }
  }, [state?.userInfo]);

  return (
    <Dashboard
      title={showingTranslateValue(
        storeCustomizationSetting?.dashboard?.update_profile
      )}
      description="This is edit profile page"
    >
      <div className="max-w-screen-2xl">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h2 className="text-xl font-serif font-semibold mb-5">
                {showingTranslateValue(
                  storeCustomizationSetting?.dashboard?.update_profile
                )}
              </h2>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="bg-white space-y-6">
              <div>
                <Label label="Photo" />
                <div className="mt-1 flex items-center">
                  <Uploader imageUrl={imageUrl} setImageUrl={setImageUrl} />
                </div>
              </div>
            </div>

            <div className="mt-10 sm:mt-0">
              <div className="md:grid-cols-6 md:gap-6">
                <div className="mt-5 md:mt-0 md:col-span-2">
                  <div className="lg:mt-6 mt-4 bg-white">
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-3">
                        <InputArea
                          register={register}
                          label={showingTranslateValue(
                            storeCustomizationSetting?.dashboard?.full_name
                          )}
                          name="name"
                          type="text"
                          placeholder={showingTranslateValue(
                            storeCustomizationSetting?.dashboard?.full_name
                          )}
                        />
                        <Error errorName={errors.name} />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <InputArea
                          register={register}
                          label={showingTranslateValue(
                            storeCustomizationSetting?.dashboard?.address
                          )}
                          name="address"
                          type="text"
                          placeholder={showingTranslateValue(
                            storeCustomizationSetting?.dashboard?.address
                          )}
                        />
                        <Error errorName={errors.address} />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <InputArea
                          register={register}
                          label={showingTranslateValue(
                            storeCustomizationSetting?.dashboard?.user_phone
                          )}
                          name="phone"
                          type="tel"
                          placeholder={showingTranslateValue(
                            storeCustomizationSetting?.dashboard?.user_phone
                          )}
                        />
                        <Error errorName={errors.phone} />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <InputArea
                          register={register}
                          name="email"
                          type="email"
                          readOnly={true}
                          defaultValue={state?.userInfo?.email}
                          label={showingTranslateValue(
                            storeCustomizationSetting?.dashboard?.user_email
                          )}
                          placeholder={showingTranslateValue(
                            storeCustomizationSetting?.dashboard?.user_email
                          )}
                        />
                        <Error errorName={errors.email} />
                      </div>
                    </div>
                    <div className="col-span-6 sm:col-span-3 mt-5 text-right">
                      {loading ? (
                        <button
                          disabled={loading}
                          type="submit"
                          className="md:text-sm leading-5 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-medium text-center justify-center border-0 border-transparent rounded-md placeholder-white focus-visible:outline-none focus:outline-none bg-emerald-500 text-white px-5 md:px-6 lg:px-8 py-2 md:py-3 lg:py-3 hover:text-white hover:bg-emerald-600 h-12 mt-1 text-sm lg:text-sm w-full sm:w-auto"
                        >
                          <img
                            src="/loader/spinner.gif"
                            alt="Loading"
                            width={20}
                            height={10}
                          />
                          <span className="font-serif ml-2 font-light">
                            Processing
                          </span>
                        </button>
                      ) : (
                        <button
                          disabled={loading}
                          type="submit"
                          className="md:text-sm leading-5 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-medium text-center justify-center border-0 border-transparent rounded-md placeholder-white focus-visible:outline-none focus:outline-none bg-emerald-500 text-white px-5 md:px-6 lg:px-8 py-2 md:py-3 lg:py-3 hover:text-white hover:bg-emerald-600 h-12 mt-1 text-sm lg:text-sm w-full sm:w-auto"
                        >
                          {showingTranslateValue(
                            storeCustomizationSetting?.dashboard?.update_button
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Dashboard>
  );
};

export default UpdateProfile;
