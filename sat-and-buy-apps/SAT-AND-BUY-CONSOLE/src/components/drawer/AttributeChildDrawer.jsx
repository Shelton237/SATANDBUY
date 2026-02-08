import React from "react";
import Scrollbars from "react-custom-scrollbars-2";
import { useTranslation } from "react-i18next";

//internal import
import Title from "@/components/form/others/Title";
import Error from "@/components/form/others/Error";
import InputArea from "@/components/form/input/InputArea";
import LabelArea from "@/components/form/selectOption/LabelArea";
import SwitchToggle from "@/components/form/switch/SwitchToggle";
import DrawerButton from "@/components/form/button/DrawerButton";
import useAttributeSubmit from "@/hooks/useAttributeSubmit";
import Loading from "../preloader/Loading";
import TextAreaCom from "@/components/form/input/TextAreaCom";

const AttributeChildDrawer = ({ id, attributeId, attributeSlug }) => {
  const {
    handleSubmit,
    onSubmit,
    register,
    errors,
    isLoading,
    isSubmitting,
    published,
    setPublished,
    handleSelectLanguage,
  } = useAttributeSubmit(id, attributeId);
  const { t } = useTranslation();

  const renderStatusToggle = (value, toggle) => (
    <div className="grid grid-cols-6 gap-3 mb-6 items-center">
      <LabelArea label={t("Status")} />
      <div className="col-span-8 sm:col-span-4">
        <SwitchToggle
          title={value ? t("Show") : t("Hide")}
          handleProcess={() => toggle((prev) => !prev)}
          processOption={value}
        />
      </div>
    </div>
  );

  const renderFieldsByCode = () => {
    switch (attributeSlug) {
      case "sizes":
        return (
          <>
            <div className="grid grid-cols-6 gap-3 mb-6 items-center">
              <LabelArea label={t("DisplayName")} />
              <div className="col-span-8 sm:col-span-4">
                <InputArea
                  required={true}
                  register={register}
                  name="name"
                  type="text"
                  placeholder="Ex: S, M, L, XL"
                />
                <Error errorName={errors.name} />
              </div>
            </div>
            {renderStatusToggle(published, setPublished)}
          </>
        );

      case "colors":
        return (
          <>
            <div className="grid grid-cols-6 gap-3 mb-6 items-center">
              <LabelArea label={t("DisplayName")} />
              <div className="col-span-8 sm:col-span-4">
                <InputArea
                  required={true}
                  register={register}
                  name="name"
                  type="text"
                  placeholder="Ex: Red, Blue, Green"
                />
                <Error errorName={errors.name} />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 mb-6 items-center">
              <LabelArea label={t("HexCode")} />
              <div className="col-span-8 sm:col-span-4">
                <InputArea
                  register={register}
                  name="hexCode"
                  type="text"
                  placeholder="#FF0000"
                />
                <Error errorName={errors.hexCode} />
              </div>
            </div>
            {renderStatusToggle(published, setPublished)}
          </>
        );

      case "brands":
        return (
          <>
            <div className="grid grid-cols-6 gap-3 mb-6 items-center">
              <LabelArea label={t("DisplayName")} />
              <div className="col-span-8 sm:col-span-4">
                <InputArea
                  required={true}
                  register={register}
                  name="name"
                  type="text"
                  placeholder="Ex: Nike, Adidas, Zara"
                />
                <Error errorName={errors.name} />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 mb-6 items-start">
              <LabelArea label={`${t("Description")} (${t("Optional") || "optional"})`} />
              <div className="col-span-8 sm:col-span-4">
                <TextAreaCom
                  register={register}
                  name="description"
                  placeholder="Short description"
                />
                <Error errorName={errors.description} />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 mb-6 items-center">
              <LabelArea label={`${t("Logo")} URL (${t("Optional") || "optional"})`} />
              <div className="col-span-8 sm:col-span-4">
                <InputArea
                  register={register}
                  name="logoUrl"
                  type="text"
                  placeholder="https://example.com/logo.png"
                />
                <Error errorName={errors.logoUrl} />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 mb-6 items-center">
              <LabelArea label={`${t("HexCode")} (${t("Optional") || "optional"})`} />
              <div className="col-span-8 sm:col-span-4">
                <InputArea
                  register={register}
                  name="hexCode"
                  type="text"
                  placeholder="#000000"
                />
                <Error errorName={errors.hexCode} />
              </div>
            </div>
            {renderStatusToggle(published, setPublished)}
          </>
        );

      default:
        return (
          <>
            <div className="grid grid-cols-6 gap-3 mb-6 items-center">
              <LabelArea label={t("DisplayName")} />
              <div className="col-span-8 sm:col-span-4">
                <InputArea
                  required={true}
                  register={register}
                  name="name"
                  type="text"
                  placeholder="Enter name"
                />
                <Error errorName={errors.name} />
              </div>
            </div>
            {renderStatusToggle(published, setPublished)}
          </>
        );
    }
  };

  return (
    <>
      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {id ? (
          <Title
            register={register}
            handleSelectLanguage={handleSelectLanguage}
            title={t("UpdateAttributeValues")}
            description={t("UpdateAttributeDesc")}
          />
        ) : (
          <Title
            register={register}
            handleSelectLanguage={handleSelectLanguage}
            title={t("AddAttributeValues")}
            description={t("AddAttributeDesc")}
          />
        )}
      </div>

      <Scrollbars className="w-full md:w-7/12 lg:w-8/12 xl:w-8/12 relative dark:bg-gray-700 dark:text-gray-200">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 pt-8 flex-grow scrollbar-hide w-full max-h-full pb-40">
            {isLoading ? <Loading /> : renderFieldsByCode()}
          </div>
          <DrawerButton
            id={id}
            title={attributeSlug || "Attribute Value"}
            isSubmitting={isSubmitting}
          />
        </form>
      </Scrollbars>
    </>
  );
};

export default AttributeChildDrawer;
