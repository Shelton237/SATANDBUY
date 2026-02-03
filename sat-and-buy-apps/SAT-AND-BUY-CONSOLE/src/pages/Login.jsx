import React from "react";
import { Link } from "react-router-dom";
import { Button, Select } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";

// Components
import LabelArea from "@/components/form/selectOption/LabelArea";
import InputArea from "@/components/form/input/InputArea";
import CMButton from "@/components/form/button/CMButton";

// Assets
import Logo from "@/assets/img/logo/logo.png";

// Hooks
import useLoginSubmit from "@/hooks/useLoginSubmit";

const Login = () => {
  const { t, i18n } = useTranslation();
  const { onSubmit, register, handleSubmit, errors, loading } = useLoginSubmit();

  return (
    <div className="flex items-center min-h-screen p-6 bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 h-full max-w-4xl mx-auto overflow-hidden bg-white rounded-2xl shadow-2xl dark:bg-gray-800">

        {/* Header */}
        <div className="py-4 text-center border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl md:text-2xl font-bold text-gray-700 dark:text-gray-200">
            {"ESPACE D'ADMINISTRATION"}
          </h1>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Logo Section */}
          <div className="flex items-center justify-center h-40 md:h-auto md:w-1/2 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900">
            <img
              aria-hidden="true"
              className="object-contain w-40 md:w-56"
              src={Logo}
              alt="Logo"
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Form Section */}
          <main className="flex items-center justify-center p-6 sm:p-12 md:w-1/2">
            <div className="w-full">
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <LabelArea label={t("Email")} />
                <InputArea
                  required
                  register={register}
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="john@doe.com"
                  error={errors.email}
                />

                <div className="mt-6">
                  <LabelArea label={t("Password")} />
                  <InputArea
                    required
                    register={register}
                    label="Password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="***************"
                    error={errors.password}
                  />
                </div>

                <div className="mt-6">
                  {loading ? (
                    <CMButton
                      disabled
                      type="submit"
                      className="bg-emerald-600 rounded-md h-12 w-full"
                    />
                  ) : (
                    <Button type="submit" className="h-12 w-full bg-emerald-600 hover:bg-emerald-700">
                      {t("LoginTitle")}
                    </Button>
                  )}
                </div>
              </form>

              <p className="mt-6 text-center">
                <Link
                  className="text-sm font-medium text-emerald-500 dark:text-emerald-400 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  to="/forgot-password"
                >
                  {t("ForgotPassword")}
                </Link>
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Login);
