import { Avatar, TableBody, TableCell, TableRow } from "@windmill/react-ui";
import { Link } from "react-router-dom";
import { IoRemoveSharp } from "react-icons/io5";

import CheckBox from "@/components/form/others/CheckBox";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import MainDrawer from "@/components/drawer/MainDrawer";
import CategoryDrawer from "@/components/drawer/CategoryDrawer";
import ShowHideButton from "@/components/table/ShowHideButton";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useTranslation } from "react-i18next";

const CategoryTable = ({
  data,
  lang,
  isCheck,
  categories,
  setIsCheck,
  useParamId,
  showChild,
}) => {
  const { title, serviceId, handleModalOpen, handleUpdate } = useToggleDrawer();
  const { showingTranslateValue } = useUtilsFunction();
  const { t, i18n } = useTranslation();

  const handleClick = (e) => {
    const { id, checked } = e.target;
    setIsCheck((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const handleUpdateCategory = (category) => {
    handleUpdate(category.id);
  };

  const handleDeleteCategory = (category) => {
    if (!category?.id) {
      notifyError("Please select a category first!");
      return;
    }
    handleModalOpen(category.id, showingTranslateValue(category?.name));
  };

  return (
    <>
      {isCheck?.length < 1 && (
        <DeleteModal
          useParamId={useParamId}
          id={serviceId}
          title={title}
          category={serviceId}
        />
      )}

      <MainDrawer>
        <CategoryDrawer id={serviceId} data={data} lang={lang} />
      </MainDrawer>

      <TableBody>
        {(categories ?? []).map((category) => (

          <TableRow key={category.id}>
            <TableCell>
              <CheckBox
                type="checkbox"
                name="category"
                id={category.id}
                handleClick={handleClick}
                isChecked={isCheck?.includes(category.id)}
              />
            </TableCell>

            <TableCell className="font-semibold uppercase text-xs">
              {category?.id}
            </TableCell>

            <TableCell>
              <div>
                <i className={`fas ${category.icon} text-lg text-green-500`} />
              </div>
            </TableCell>

            <TableCell className="font-medium text-sm ">
              {Array.isArray(category?.children) && category.children.length > 0 ? (
                <Link to={`/categories/${category?.id}`} className="text-blue-700">
                  {showingTranslateValue(category?.name)}

                  {showChild && (
                    <div className="pl-2 ">
                      {category.children.map((child) => (
                        <div key={child.id}>
                          <Link to={`/categories/${child?.id}`} className="text-blue-700">
                            <div className="flex text-xs items-center text-blue-800">
                              <span className="text-xs text-gray-500 pr-1">
                                <IoRemoveSharp />
                              </span>
                              <span className="text-gray-500">
                                {showingTranslateValue(child.name)}
                              </span>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </Link>
              ) : (
                <div className="flex flex-col">
                  <span className="font-semibold">{category?.name?.fr}</span>
                  <span className="text-gray-600">{category?.name?.en}</span>
                </div>
              )}
            </TableCell>

            <TableCell className="text-sm flex flex-col">
              <span className="font-semibold">{category?.type?.fr}</span>
              <span className="text-gray-600">{category?.type?.en}</span>
            </TableCell>

            <TableCell className="text-center">
              <ShowHideButton id={category.id} category status={category.status} />
            </TableCell>

            <TableCell>
              <EditDeleteButton
                id={category.id}
                parent={category}
                isCheck={isCheck}
                children={category.children ?? []}
                handleUpdate={() => handleUpdateCategory(category)}
                handleModalOpen={() => handleDeleteCategory(category)}
                title={showingTranslateValue(category?.name)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default CategoryTable;