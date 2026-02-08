import {
  Button,
  Card,
  CardBody,
  Pagination,
  Table,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
} from "@windmill/react-ui";
import React, { useContext, useMemo, useState } from "react";
import { FiChevronRight, FiEdit, FiPlus, FiTrash2 } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

//internal import
import ChildAttributeTable from "@/components/attribute/ChildAttributeTable";
import AttributeChildDrawer from "@/components/drawer/AttributeChildDrawer";
import BulkActionDrawer from "@/components/drawer/BulkActionDrawer";
import MainDrawer from "@/components/drawer/MainDrawer";
import CheckBox from "@/components/form/others/CheckBox";
import DeleteModal from "@/components/modal/DeleteModal";
import Loading from "@/components/preloader/Loading";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import { SidebarContext } from "@/context/SidebarContext";
import useAsync from "@/hooks/useAsync";
import useFilter from "@/hooks/useFilter";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import AttributeServices from "@/services/AttributeServices";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import AnimatedContent from "@/components/common/AnimatedContent";

const ATTRIBUTE_KEYWORDS = {
  sizes: ["size", "sizes", "taille", "tailles"],
  colors: ["color", "colors", "couleur", "couleurs"],
  brands: ["brand", "brands", "marque", "marques"],
};

const slugify = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-");

const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

const ChildAttributes = () => {
  let { code } = useParams();
  const { t } = useTranslation();
  const { handleDeleteMany, allId, serviceId, handleUpdateMany } = useToggleDrawer();
  const { toggleDrawer, lang } = useContext(SidebarContext);
  const isObjectId = useMemo(() => OBJECT_ID_REGEX.test(code || ""), [code]);

  const fetchAttributePayload = () => {
    if (isObjectId) {
      return AttributeServices.getById(code).then((attribute) => ({
        attribute,
        data: attribute?.variants || [],
        variants: attribute?.variants || [],
      }));
    }
    return AttributeServices.getAll({}, code);
  };

  const { data: attributeResponse, loading, error } = useAsync(fetchAttributePayload);
  const attributeMeta = attributeResponse?.attribute;
  const attributeId =
    attributeMeta?.id || attributeMeta?._id || (isObjectId ? code : null);
  const variants = Array.isArray(attributeResponse?.data)
    ? attributeResponse.data
    : [];
  const { showingTranslateValue } = useUtilsFunction();
  const resolvedTitle = showingTranslateValue(attributeMeta?.title);
  const resolvedName = showingTranslateValue(attributeMeta?.name);
  const attributeLabel = resolvedTitle || resolvedName || code;

  const attributeSlug = useMemo(() => {
    if (!attributeMeta) return code;
    const candidates = [
      attributeMeta.slug,
      attributeMeta.code,
      attributeMeta.id,
      attributeMeta._id,
      resolvedTitle,
      resolvedName,
    ]
      .filter(Boolean)
      .map((candidate) => slugify(candidate));

    for (const [key, keywords] of Object.entries(ATTRIBUTE_KEYWORDS)) {
      if (candidates.some((candidate) => keywords.includes(candidate))) {
        return key;
      }
    }
    return code;
  }, [attributeMeta, code, resolvedTitle, resolvedName]);

  const {
    totalResults,
    resultsPerPage,
    dataTable,
    serviceData,
    handleChangePage,
  } = useFilter(variants);

  // react hook
  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);

  const handleSelectAll = () => {
    setIsCheckAll(!isCheckAll);
    setIsCheck(variants?.map((value) => value.id || value._id));
    if (isCheckAll) {
      setIsCheck([]);
    }
  };

  return (
    <>
      <PageTitle>
        {t("AttributeValues")}
        {attributeLabel ? ` — ${attributeLabel}` : ""}
      </PageTitle>
      {/* 
      <DeleteModal
        ids={allId}
        setIsCheck={setIsCheck}
        title="Selected Attribute Value(s)"
      /> */}

      {/* <BulkActionDrawer
        attributes={attributeData}
        ids={allId}
        title="Attribute Value(s)"
        childId={id}
      /> */}

      {attributeId && (
        <MainDrawer>
          <AttributeChildDrawer
            id={serviceId}
            attributeId={attributeId}
            attributeSlug={attributeSlug}
          />
        </MainDrawer>
      )}

      <AnimatedContent>
        <div className="flex items-center pb-4">
          <ol className="flex items-center w-full overflow-hidden font-serif">
            <li className="text-sm pr-1 transition duration-200 ease-in cursor-pointer hover:text-emerald-500 font-semibold">
              <Link className="text-blue-700" to={`/attributes`}>
                {t("Attributes")}
              </Link>
            </li>

            <span className="flex items-center font-serif dark:text-gray-400">
              <li className="text-sm mt-[1px]">
                {" "}
                <FiChevronRight />{" "}
              </li>

              <li className="text-sm pl-1 font-semibold dark:text-gray-400">
                {!loading && attributeLabel}
              </li>
            </span>
          </ol>
        </div>

        <Card className="min-w-0 shadow-xs overflow-hidden bg-white dark:bg-gray-800 mb-5">
          <CardBody className="py-3 grid gap-4 justify-end lg:gap-4 xl:gap-4 md:flex xl:flex">
            <div className="flex justify-end items-end">
              <Button
                onClick={toggleDrawer}
                className="rounded-md h-12"
                disabled={!attributeId}
              >
                <span className="mr-3">
                  <FiPlus />
                </span>
                {t("AddValue")}
              </Button>
            </div>

            <div className="w-full md:w-24 lg:w-24 xl:w-24">
              <Button
                disabled={isCheck.length < 1}
                onClick={() => handleUpdateMany(isCheck)}
                className="w-full rounded-md h-12"
              >
                <FiEdit />
                <span className="ml-2">{t("BulkAction")}</span>
              </Button>
            </div>

            <Button
              disabled={isCheck.length < 1}
              onClick={() => handleDeleteMany(isCheck)}
              className="rounded-md h-12 bg-red-500"
            >
              <span className="mr-3">
                <FiTrash2 />
              </span>
              {t("Delete")}
            </Button>
          </CardBody>
        </Card>
      </AnimatedContent>

      {loading ? (
        <Loading loading={loading} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : serviceData?.length !== 0 ? (
        <TableContainer className="mb-8">
          <Table>
            <TableHeader>
              <tr>
                <TableCell>
                  <CheckBox
                    type="checkbox"
                    name="selectAll"
                    id="selectAll"
                    handleClick={handleSelectAll}
                    isChecked={isCheckAll}
                  />
                </TableCell>
                <TableCell>{t("Name")}</TableCell>
                {attributeSlug === "colors" && (
                  <TableCell>{t("HexCode")}</TableCell>
                )}

                {attributeSlug === "brands" && (
                  <>
                    <TableCell>{t("Description")}</TableCell>
                    <TableCell>{t("Logo")}</TableCell>
                  </>
                )}

                <TableCell className="text-right">{t("Actions")}</TableCell>
              </tr>
            </TableHeader>

            <ChildAttributeTable
              att={attributeMeta}
              lang={lang}
              loading={loading}
              isCheck={isCheck}
              setIsCheck={setIsCheck}
              childAttributes={dataTable}
              attributeId={attributeId}
              attributeSlug={attributeSlug}
            />
          </Table>
          <TableFooter>
            <Pagination
              totalResults={totalResults}
              resultsPerPage={resultsPerPage}
              onChange={handleChangePage}
              label={t("TableNavigation") || "Table navigation"}
            />
          </TableFooter>
        </TableContainer>
      ) : (
        <NotFound title={t("AttributeValues")} />
      )}
    </>
  );
};

export default ChildAttributes;
