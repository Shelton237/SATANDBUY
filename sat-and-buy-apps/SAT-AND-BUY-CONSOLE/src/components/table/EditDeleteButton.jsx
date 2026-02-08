import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FiEdit, FiTrash2, FiZoomIn } from "react-icons/fi";

import Tooltip from "@/components/tooltip/Tooltip";

const EditDeleteButton = ({
  id,
  title,
  handleUpdate,
  handleModalOpen,
  isCheck,
  product,
  parent,
  children,
  hasValues = false,
}) => {
  const { t } = useTranslation();
  const actionDisabled = isCheck?.length > 0 || hasValues;
  const baseEditClasses = actionDisabled
    ? "p-2 cursor-not-allowed text-gray-300 focus:outline-none"
    : "p-2 cursor-pointer text-gray-400 hover:text-emerald-600 focus:outline-none";
  const baseDeleteClasses = actionDisabled
    ? "p-2 cursor-not-allowed text-gray-300 focus:outline-none"
    : "p-2 cursor-pointer text-gray-400 hover:text-red-600 focus:outline-none";
  const editTooltip = hasValues ? t("AttributeEditDisabled") : t("Edit");
  const deleteTooltip = hasValues ? t("AttributeDeleteDisabled") : t("Delete");

  const handleEdit = () => {
    if (actionDisabled) return;
    handleUpdate?.(id);
  };

  const handleDelete = () => {
    if (actionDisabled) return;
    handleModalOpen?.(id, title, product);
  };

  return (
    <>
      <div className="flex justify-end text-right">
        {children?.length > 0 ? (
          <>
            <Link
              to={`/categories/${parent?.id}`}
              className="p-2 cursor-pointer text-gray-400 hover:text-emerald-600 focus:outline-none"
            >
              <Tooltip
                id="view"
                Icon={FiZoomIn}
                title={t("View")}
                bgColor="#10B981"
              />
            </Link>

            <button
              disabled={actionDisabled}
              onClick={handleEdit}
              className={baseEditClasses}
            >
              <Tooltip
                id="edit"
                Icon={FiEdit}
                title={editTooltip}
                bgColor="#10B981"
              />
            </button>
          </>
        ) : (
          <button
            disabled={actionDisabled}
            onClick={handleEdit}
            className={baseEditClasses}
          >
            <Tooltip
              id="edit"
              Icon={FiEdit}
              title={editTooltip}
              bgColor="#10B981"
            />
          </button>
        )}

        <button
          disabled={actionDisabled}
          onClick={handleDelete}
          className={baseDeleteClasses}
        >
          <Tooltip
            id="delete"
            Icon={FiTrash2}
            title={deleteTooltip}
            bgColor="#EF4444"
          />
        </button>
      </div>
    </>
  );
};

export default EditDeleteButton;
