import { TableBody, TableCell, TableRow } from "@windmill/react-ui";
import React from "react";

//internal import
import useToggleDrawer from "@/hooks/useToggleDrawer";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import MainDrawer from "@/components/drawer/MainDrawer";
import CheckBox from "@/components/form/others/CheckBox";
import DeleteModal from "@/components/modal/DeleteModal";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import ShowHideButton from "@/components/table/ShowHideButton";
import AttributeChildDrawer from "@/components/drawer/AttributeChildDrawer";

const ChildAttributeTable = ({
  att,
  loading,
  isCheck,
  setIsCheck,
  childAttributes,
  attributeId,
  attributeSlug,
}) => {

  const { title, serviceId, handleModalOpen, handleUpdate } = useToggleDrawer();
  const { showingTranslateValue } = useUtilsFunction();

  const handleClick = (e) => {
    const { id, checked } = e.target;
    setIsCheck([...isCheck, id]);
    if (!checked) {
      setIsCheck(isCheck.filter((item) => item !== id));
    }
  };

  const formatName = (value) =>
    typeof value === "object" ? showingTranslateValue(value) : value;

  const renderAttributeData = (attribute) => {
    switch (attributeSlug) {
      case "sizes":
        return (
          <>
            <TableCell className="font-medium text-sm">
              {formatName(attribute?.name)}
            </TableCell>
          </>
        );

      case "colors":
        return (
          <>
            <TableCell className="font-medium text-sm">
              {formatName(attribute?.name)}
            </TableCell>
            <TableCell className="font-medium text-sm">
              {attribute?.hexCode ? (
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-2 border border-gray-300"
                    style={{ backgroundColor: attribute.hexCode }}
                  />
                  {attribute.hexCode}
                </div>
              ) : (
                "-"
              )}
            </TableCell>
          </>
        );

      case "brands":
        return (
          <>
            <TableCell className="font-medium text-sm">
              {formatName(attribute?.name)}
            </TableCell>
            <TableCell className="font-medium text-sm">
              {attribute?.description || "-"}
            </TableCell>
            <TableCell className="font-medium text-sm">
              {attribute?.logoUrl ? (
                <img
                  src={attribute.logoUrl}
                  alt={formatName(attribute?.name)}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                "-"
              )}
            </TableCell>
          </>
        );

      default:
        return (
          <>
            <TableCell className="font-medium text-sm">
              {formatName(attribute?.name)}
            </TableCell>
          </>
        );
    }
  };

  return (
    <>
      {attributeId && isCheck.length < 1 && (
        <DeleteModal
          id={serviceId}
          title={title}
          setIsCheck={setIsCheck}
          code={attributeId}
        />
      )}

      {attributeId && isCheck.length < 2 && (
        <MainDrawer>
          <AttributeChildDrawer
            id={serviceId}
            attributeId={attributeId}
            attributeSlug={attributeSlug}
          />
        </MainDrawer>
      )}

      <TableBody>
        {childAttributes?.map((attribute, index) => (
          <TableRow key={index + 1}>
            <TableCell>
              <CheckBox
                type="checkbox"
                name="child-attribute"
                id={attribute.id}
                handleClick={handleClick}
                isChecked={isCheck?.includes(attribute.id)}
              />
            </TableCell>

            {renderAttributeData(attribute)}

            <TableCell>
              <EditDeleteButton
                id={attribute.id}
                isCheck={isCheck}
                setIsCheck={setIsCheck}
                handleUpdate={handleUpdate}
                handleModalOpen={handleModalOpen}
                title={showingTranslateValue(attribute.name)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default ChildAttributeTable;
