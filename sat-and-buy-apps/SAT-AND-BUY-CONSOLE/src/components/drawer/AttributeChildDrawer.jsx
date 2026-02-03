import React from "react";
import Scrollbars from "react-custom-scrollbars-2";

//internal import
import Title from "@/components/form/others/Title";
import Error from "@/components/form/others/Error";
import InputArea from "@/components/form/input/InputArea";
import LabelArea from "@/components/form/selectOption/LabelArea";
import SwitchToggle from "@/components/form/switch/SwitchToggle";
import DrawerButton from "@/components/form/button/DrawerButton";
import useAttributeSubmit from "@/hooks/useAttributeSubmit";
import Loading from "../preloader/Loading";

const AttributeChildDrawer = ({ id, code }) => {
  const {
    handleSubmit,
    onSubmit,
    register,
    errors,
    isLoading,
    isSubmitting,
    setPublished,
    handleSelectLanguage,
  } = useAttributeSubmit(id, code);

  const renderFieldsByCode = () => {
    switch (code) {
      case "sizes":
        return (
          <>
            <div className="grid grid-cols-6 gap-3 mb-6 items-center">
              <LabelArea label="Size Name" />
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
          </>
        );

      case "colors":
        return (
          <>
            <div className="grid grid-cols-6 gap-3 mb-6 items-center">
              <LabelArea label="Color Name" />
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
              <LabelArea label="Hex Code" />
              <div className="col-span-8 sm:col-span-4">
                <InputArea
                  required={true}
                  register={register}
                  name="hexCode"
                  type="text"
                  placeholder="#FF0000"
                />
                <Error errorName={errors.hexCode} />
              </div>
            </div>
          </>
        );

      case "brands":
        return (
          <>
            <div className="grid grid-cols-6 gap-3 mb-6 items-center">
              <LabelArea label="Brand Name" />
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

            <div className="grid grid-cols-6 gap-3 mb-6 items-center">
              <LabelArea label="Description" />
              <div className="col-span-8 sm:col-span-4">
                <InputArea
                  register={register}
                  name="description"
                  type="text"
                  placeholder="Short description"
                />
                <Error errorName={errors.description} />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 mb-6 items-center">
              <LabelArea label="Logo URL" />
              <div className="col-span-8 sm:col-span-4">
                <InputArea
                  required={true}
                  register={register}
                  name="logoUrl"
                  type="text"
                  placeholder="https://example.com/logo.png"
                />
                <Error errorName={errors.logoUrl} />
              </div>
            </div>
          </>
        );
        
      default:
        return (
          <div className="grid grid-cols-6 gap-3 mb-6 items-center">
            <LabelArea label="Name" />
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
            title="Update Attribute Values"
            description="Add your attribute values and necessary information from here"
          />
        ) : (
          <Title
            register={register}
            handleSelectLanguage={handleSelectLanguage}
            title="Add Attribute Values"
            description="Add your attribute values and necessary information from here"
          />
        )}
      </div>

      <Scrollbars className="w-full md:w-7/12 lg:w-8/12 xl:w-8/12 relative dark:bg-gray-700 dark:text-gray-200">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 pt-8 flex-grow scrollbar-hide w-full max-h-full pb-40">
            {isLoading ? <Loading /> : renderFieldsByCode()}
          </div>
          <DrawerButton id={id} title={code} isSubmitting={isSubmitting} />
        </form>
      </Scrollbars>
    </>
  );
};

export default AttributeChildDrawer;