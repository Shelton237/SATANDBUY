import {
  Button,
  Card,
  CardBody,
  Table,
  TableCell,
  TableContainer,
  TableHeader,
} from "@windmill/react-ui";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { FiChevronsRight, FiTrash2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import useAsync from "@/hooks/useAsync";
import AttributeServices from "@/services/AttributeServices";
import PageTitle from "@/components/Typography/PageTitle";
import { SidebarContext } from "@/context/SidebarContext";
import MainDrawer from "@/components/drawer/MainDrawer";
import AttributeDrawer from "@/components/drawer/AttributeDrawer";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import DeleteModal from "@/components/modal/DeleteModal";
import useToggleDrawer from "@/hooks/useToggleDrawer";

const Attributes = () => {
  const { t } = useTranslation();
  const { toggleDrawer, setServiceId, serviceId, title } =
    useContext(SidebarContext);
  const { handleModalOpen } = useToggleDrawer();
  const { showingTranslateValue } = useUtilsFunction();

  const {
    data: attributeResponse,
    loading,
    error,
  } = useAsync(() => AttributeServices.getAll());

  const attributes = attributeResponse?.data || [];

  return (
    <>
      <PageTitle>{t("AttributeTitle")}</PageTitle>
      <DeleteModal setIsCheck={() => {}} title={title} />

      <MainDrawer>
        <AttributeDrawer id={serviceId} />
      </MainDrawer>

      <Card className="min-w-0 shadow-xs overflow-hidden bg-white dark:bg-gray-800 mb-5">
        <CardBody className="flex justify-end">
          <Button
            onClick={() => {
              setServiceId(null);
              toggleDrawer();
            }}
            className="rounded-md h-12 px-6"
          >
            {t("AddAttribute")}
          </Button>
        </CardBody>
      </Card>

      <Card className="min-w-0 shadow-xs overflow-hidden bg-white dark:bg-gray-800">
        <CardBody>
          <TableContainer>
            <Table>
              <TableHeader>
                <tr>
                  <TableCell>{t("DrawerAttributeTitle")}</TableCell>
                  <TableCell>{t("Variants")}</TableCell>
                  <TableCell className="text-right">{t("Actions")}</TableCell>
                </tr>
              </TableHeader>
              <tbody className="bg-white divide-y divide-gray-100 dark:divide-gray-700 dark:bg-gray-800">
                {error && (
                  <tr>
                    <TableCell colSpan={3} className="text-center text-red-500 py-4">
                      {error}
                    </TableCell>
                  </tr>
                )}
                {attributes.length === 0 && !loading && !error && (
                  <tr>
                    <TableCell colSpan={3} className="text-center py-4">
                      {t("sorryProductNotFound") || "No attributes found."}
                    </TableCell>
                  </tr>
                )}
                {attributes.map((attr) => {
                  const attributeId = attr.id || attr._id;
                  const attributeTitle = showingTranslateValue(attr?.title) || "-";
                  const attributeName = showingTranslateValue(attr?.name) || "-";
                  const valuesCount = Array.isArray(attr?.variants)
                    ? attr.variants.length
                    : 0;
                  return (
                    <tr key={attributeId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <TableCell>
                        <div className="font-medium text-gray-700 dark:text-gray-200">
                          {attributeTitle}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {attributeName}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                        {valuesCount}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleModalOpen(
                                attributeId,
                                attributeTitle || attributeName || "Attribute"
                              )
                            }
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title={t("Delete")}
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                          <Link
                            to={`/attributes/${attributeId}`}
                            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-500"
                          >
                            <FiChevronsRight className="w-5 h-5" />
                          </Link>
                        </div>
                      </TableCell>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    </>
  );
};

export default Attributes;
