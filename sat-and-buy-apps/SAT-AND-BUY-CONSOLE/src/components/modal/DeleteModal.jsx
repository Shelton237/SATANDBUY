import { Button, Modal, ModalBody, ModalFooter } from "@windmill/react-ui";
import React, { useContext, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

// internal imports
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import { SidebarContext } from "@/context/SidebarContext";
import AdminServices from "@/services/AdminServices";
import CategoryServices from "@/services/products/CategoryServices";
import CouponServices from "@/services/CouponServices";
import CustomerServices from "@/services/CustomerServices";
import LanguageServices from "@/services/LanguageServices";
import ProductServices from "@/services/ProductServices";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import AttributeServices from "@/services/AttributeServices";
import CurrencyServices from "@/services/CurrencyServices";
import { notifyError, notifySuccess } from "@/utils/toast";

// code pour gerer les differents attributs
const DeleteModal = ({ ids, setIsCheck, category, title, useParamId, code }) => {
  const { isModalOpen, closeModal, setIsUpdate } = useContext(SidebarContext);
  const { serviceId, setServiceId } = useToggleDrawer();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);

      if (location.pathname === "/products") {
        if (ids) {
          const res = await ProductServices.deleteManyProducts({ ids });
          setIsUpdate(true);
          notifySuccess(res.message);
          setIsCheck([]);
        } else {
          const res = await ProductServices.deleteProduct(serviceId);
          setIsUpdate(true);
          notifySuccess(res.message);
        }
        closeModal();
        setServiceId();
        setIsSubmitting(false);
      }

      if (location.pathname === "/coupons") {
        if (ids) {
          const res = await CouponServices.deleteManyCoupons({ ids });
          setIsUpdate(true);
          notifySuccess(res.message);
          setIsCheck([]);
        } else {
          const res = await CouponServices.deleteCoupon(serviceId);
          setIsUpdate(true);
          notifySuccess(res.message);
        }
        closeModal();
        setServiceId();
        setIsSubmitting(false);
      }

      if (location.pathname === "/categories" || category) {
        if (ids) {
          const res = await CategoryServices.deleteManyCategory({ ids });
          setIsUpdate(true);
          notifySuccess(res.message);
          setIsCheck([]);
        } else {
          if (!serviceId) {
            notifyError("Please select a category first!");
            setIsSubmitting(false);
            return closeModal();
          }
          const res = await CategoryServices.deleteOne(serviceId);
          setIsUpdate(true);
          notifySuccess(res.message);
        }
        closeModal();
        setServiceId();
        setIsSubmitting(false);
      }


      if (
        location.pathname === `/categories/${useParamId}` ||
        category
      ) {
        if (!serviceId) {
          notifyError("Please select a category first!");
          setIsSubmitting(false);
          return closeModal();
        }
        const res = await CategoryServices.deleteCategory(serviceId);
        setIsUpdate(true);
        notifySuccess(res.message);
        closeModal();
        setServiceId();
        setIsSubmitting(false);
      }

      if (location.pathname === "/customers") {
        const res = await CustomerServices.deleteCustomer(serviceId);
        setIsUpdate(true);
        notifySuccess(res.message);
        closeModal();
        setServiceId();
        setIsSubmitting(false);
      }
      if (
        location.pathname === `/attributes/${location.pathname.split("/")[2]}`
      ) {
        if (ids) {
          const res = await AttributeServices.deleteManyChildAttribute({
            id: location.pathname.split("/")[2],
            ids,
          });
          setIsUpdate(true);
          notifySuccess(res.message);
          setIsCheck([]);
        } else {
          const res = await AttributeServices.delete(serviceId, code);
          setIsUpdate(true);
          notifySuccess(res.message);
        }
        closeModal();
        setServiceId();
        setIsSubmitting(false);
      }

      if (location.pathname === "/our-staff") {
        const res = await AdminServices.deleteStaff(serviceId);
        setIsUpdate(true);
        notifySuccess(res.message);
        closeModal();
        setServiceId();
        setIsSubmitting(false);
      }

      if (location.pathname === "/languages") {
        if (ids) {
          const res = await LanguageServices.deleteManyLanguage({ ids });
          setIsUpdate(true);
          notifySuccess(res.message);
          setIsCheck([]);
        } else {
          const res = await LanguageServices.deleteLanguage(serviceId);
          setIsUpdate(true);
          notifySuccess(res.message);
        }
        closeModal();
        setServiceId();
        setIsSubmitting(false);
      }

      if (location.pathname === "/currencies") {
        if (ids) {
          const res = await CurrencyServices.deleteManyCurrency({ ids });
          setIsUpdate(true);
          notifySuccess(res.message);
          setIsCheck([]);
        } else {
          const res = await CurrencyServices.deleteCurrency(serviceId);
          setIsUpdate(true);
          notifySuccess(res.message);
        }
        closeModal();
        setServiceId();
        setIsSubmitting(false);
      }
    } catch (err) {
      notifyError(err ? err?.response?.data?.message : err?.message);
      setServiceId();
      setIsCheck([]);
      closeModal();
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalBody className="text-center custom-modal px-8 pt-6 pb-4">
          <span className="flex justify-center text-3xl mb-6 text-red-500">
            <FiTrash2 />
          </span>
          <h2 className="text-xl font-medium mb-2">
            {t("DeleteModalH2")} <span className="text-red-500">{title}</span>?
          </h2>
          <p>{t("DeleteModalPtag")}</p>
        </ModalBody>

        <ModalFooter className="justify-center">
          <Button
            className="w-full sm:w-auto hover:bg-white hover:border-gray-50"
            layout="outline"
            onClick={closeModal}
          >
            {t("modalKeepBtn")}
          </Button>
          <div className="flex justify-end">
            {isSubmitting ? (
              <Button disabled={true} type="button" className="w-full h-12 sm:w-auto">
                <img
                  src={spinnerLoadingImage}
                  alt="Loading"
                  width={20}
                  height={10}
                />
                <span className="font-serif ml-2 font-light">
                  {t("Processing")}
                </span>
              </Button>
            ) : (
              <Button onClick={handleDelete} className="w-full h-12 sm:w-auto">
                {t("modalDeletBtn")}
              </Button>
            )}
          </div>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default React.memo(DeleteModal);