import {
  Button,
  Card,
  CardBody,
  Input,
  Pagination,
  Table,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
} from "@windmill/react-ui";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiEdit, FiPlus, FiTrash2 } from "react-icons/fi";

import useAsync from "@/hooks/useAsync";
import { SidebarContext } from "@/context/SidebarContext";
import CategoryServices from "@/services/products/CategoryServices";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import useFilter from "@/hooks/useFilter";
import DeleteModal from "@/components/modal/DeleteModal";
import BulkActionDrawer from "@/components/drawer/BulkActionDrawer";
import PageTitle from "@/components/Typography/PageTitle";
import MainDrawer from "@/components/drawer/MainDrawer";
import CategoryDrawer from "@/components/drawer/CategoryDrawer";
// import UploadMany from "@/components/common/UploadMany";
// import SwitchToggleChildCat from "@/components/form/switch/SwitchToggleChildCat";
import TableLoading from "@/components/preloader/TableLoading";
import CheckBox from "@/components/form/others/CheckBox";
import CategoryTable from "@/components/category/CategoryTable";
import NotFound from "@/components/table/NotFound";
import AnimatedContent from "@/components/common/AnimatedContent";

const Category = () => {
  const { toggleDrawer, lang } = useContext(SidebarContext);
  const { data: asyncData, loading, error } = useAsync(CategoryServices.getAll);
  const { data: getAllCategories } = useAsync(CategoryServices.getAllRaw);
  const { handleDeleteMany, allId, handleUpdateMany, serviceId, handleUpdate } = useToggleDrawer();
  const { t } = useTranslation();
  const data = asyncData?.data ?? [];
  const pagination = asyncData?.pagination ?? {};
  const {
    handleSubmitCategory,
    categoryRef,
    totalResults,
    resultsPerPage,
    dataTable,
    serviceData,
    handleChangePage,
    filename,
    isDisabled,
    setCategoryType,
    handleSelectFile,
    handleUploadMultiple,
    handleRemoveSelectFile,
  } = useFilter(data);
  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);
  const [showChild, setShowChild] = useState(false);

  const handleSelectAll = () => {
    if (!isCheckAll) {
      const childIds = Array.isArray(data)
        ? data.flatMap((item) =>
            item.children?.map((li) => li.id || li._id) || []
          )
        : [];
      setIsCheck(childIds);
    } else {
      setIsCheck([]);
    }
    setIsCheckAll(!isCheckAll);
  };

  const handleResetField = () => {
    setCategoryType("");
    if (categoryRef.current) categoryRef.current.value = "";
  };

  return (
    <>
      <PageTitle>{t("Category")}</PageTitle>
      <DeleteModal ids={allId} setIsCheck={setIsCheck} />

      <BulkActionDrawer
        ids={allId}
        title="Categories"
        lang={lang}
        data={data}
        isCheck={isCheck}
      />

      <MainDrawer>
        <CategoryDrawer id={null} data={[]} lang={lang} />
      </MainDrawer>

      <AnimatedContent>
        <Card className="min-w-0 shadow-xs overflow-hidden bg-white dark:bg-gray-800 mb-5">
          <CardBody>
            <form
              onSubmit={handleSubmitCategory}
              className="py-3 grid gap-4 lg:gap-6 xl:gap-6 xl:flex"
            >
              <div className="flex justify-start w-1/2 xl:w-1/2 md:w-full">
                {/* <UploadMany
                  title="Categories"
                  exportData={getAllCategories}
                  filename={filename}
                  isDisabled={isDisabled}
                  handleSelectFile={handleSelectFile}
                  handleUploadMultiple={handleUploadMultiple}
                  handleRemoveSelectFile={handleRemoveSelectFile}
                /> */}
              </div>
              <div className="lg:flex md:flex xl:justify-end xl:w-1/2 md:w-full md:justify-start flex-grow-0">
                <div className="w-full md:w-40 lg:w-40 xl:w-40 mr-3 mb-3 lg:mb-0">
                  {/* <Button
                    disabled={isCheck.length < 1}
                    onClick={() => handleUpdateMany(isCheck)}
                    className="w-full rounded-md h-12 text-gray-600 btn-gray"
                  >
                    <span className="mr-2">
                      <FiEdit />
                    </span>
                    {t("BulkAction")}
                  </Button> */}
                </div>
                <div className="w-full md:w-32 lg:w-32 xl:w-32 mr-3 mb-3 lg:mb-0">
                  {/* <Button
                    disabled={isCheck.length < 1}
                    onClick={() => handleDeleteMany(isCheck)}
                    className="w-full rounded-md h-12 bg-red-500 btn-red"
                  >
                    <span className="mr-2">
                      <FiTrash2 />
                    </span>
                    {t("Delete")}
                  </Button> */}
                </div>
                <div className="w-full md:w-48 lg:w-48 xl:w-48">
                  <Button
                    onClick={toggleDrawer}
                    className="rounded-md h-12 w-full"
                  >
                    <span className="mr-2">
                      <FiPlus />
                    </span>
                    {t("AddCategory")}
                  </Button>
                </div>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card className="shadow-xs overflow-hidden bg-white dark:bg-gray-800 rounded-t-lg mb-4">
          <CardBody>
            <form
              onSubmit={handleSubmitCategory}
              className="flex flex-wrap items-center gap-4"
            >
              <div className="flex-grow min-w-[200px]">
                <Input
                  ref={categoryRef}
                  type="search"
                  placeholder={t("SearchCategory")}
                  aria-label={t("SearchCategory")}
                  className="h-12"
                />
              </div>

              <div className="flex gap-2 min-w-[200px]">
                <Button
                  type="submit"
                  className="h-12 w-full bg-emerald-700 text-white"
                >
                  {t("Filter")}
                </Button>

                <Button
                  layout="outline"
                  onClick={handleResetField}
                  type="reset"
                  className="h-12 w-full text-sm dark:bg-gray-700"
                >
                  <span className="text-black dark:text-gray-200">{t("Reset")}</span>
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </AnimatedContent>



      {loading ? (
        <TableLoading row={12} col={6} width={190} height={20} />
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
                <TableCell>{t("catIconTbl")}</TableCell>
                <TableCell>{t("CatTbName")}</TableCell>
                <TableCell>{t("CatTbType")}</TableCell>
                <TableCell className="text-center">
                  {t("catPublishedTbl")}
                </TableCell>
                <TableCell className="text-right">
                  {t("catActionsTbl")}
                </TableCell>
              </tr>
            </TableHeader>

            <CategoryTable
              data={data}
              lang={lang}
              isCheck={isCheck}
              categories={dataTable}
              setIsCheck={setIsCheck}
              showChild={showChild}
            />
          </Table>

          <TableFooter>
            <Pagination
              totalResults={pagination.totalElements || 0}
              resultsPerPage={pagination.size || 20}
              onChange={handleChangePage}
              label="Table navigation"
            />
          </TableFooter>
        </TableContainer>
      ) : (
        <NotFound title="Sorry, There are no categories right now." />
      )}
    </>
  );
};

export default Category;
