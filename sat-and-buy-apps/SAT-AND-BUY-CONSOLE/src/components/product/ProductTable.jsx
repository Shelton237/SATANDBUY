import { useContext, useState } from "react";
import {
  Avatar,
  Badge,
  TableBody,
  TableCell,
  TableRow,
} from "@windmill/react-ui";
import { t } from "i18next";
import { FiZoomIn } from "react-icons/fi";
import { Link } from "react-router-dom";

//internal import
import MainDrawer from "@/components/drawer/MainDrawer";
import ProductDrawer from "@/components/drawer/ProductDrawer";
import CheckBox from "@/components/form/others/CheckBox";
import DeleteModal from "@/components/modal/DeleteModal";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import ShowHideButton from "@/components/table/ShowHideButton";
import Tooltip from "@/components/tooltip/Tooltip";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import ProductServices from "@/services/ProductServices";
import { SidebarContext } from "@/context/SidebarContext";
import { AdminContext } from "@/context/AdminContext";
import { notifyError, notifySuccess } from "@/utils/toast";

//internal import

const ProductTable = ({ products, isCheck, setIsCheck }) => {
  const { title, serviceId, handleModalOpen, handleUpdate } = useToggleDrawer();
  const { currency, showingTranslateValue, getNumberTwo } = useUtilsFunction();
  const { setIsUpdate } = useContext(SidebarContext);
  const { authData } = useContext(AdminContext);
  const [approvalState, setApprovalState] = useState({
    id: null,
    action: null,
  });
  const isVendor = authData?.user?.role === "Vendeur";
  const canModerate = !isVendor;

  const handleClick = (e) => {
    const { id, checked } = e.target;
    // console.log("id", id, checked);

    setIsCheck([...isCheck, id]);
    if (!checked) {
      setIsCheck(isCheck.filter((item) => item !== id));
    }
  };

  const approvalMeta = {
    approved: { type: "success", label: "Approuve" },
    pending: { type: "warning", label: "En attente" },
    rejected: { type: "danger", label: "Rejete" },
  };

  const handleApprovalChange = async (product, status) => {
    if (!canModerate) return;
    try {
      setApprovalState({ id: product._id, action: status });
      await ProductServices.updateApprovalStatus(product._id, { status });
      notifySuccess(
        status === "approved"
          ? "Produit approuve avec succes."
          : "Statut de validation mis a jour."
      );
      setIsUpdate(true);
    } catch (err) {
      notifyError(err?.message || "Impossible de mettre a jour la validation.");
    } finally {
      setApprovalState({ id: null, action: null });
    }
  };

  return (
    <>
      {isCheck?.length < 1 && <DeleteModal id={serviceId} title={title} />}

      {isCheck?.length < 2 && (
        <MainDrawer>
          <ProductDrawer currency={currency} id={serviceId} />
        </MainDrawer>
      )}

      <TableBody>
        {products?.map((product, i) => (
          <TableRow key={i + 1}>
            <TableCell>
              <CheckBox
                type="checkbox"
                name={product?.title?.en}
                id={product._id}
                handleClick={handleClick}
                isChecked={isCheck?.includes(product._id)}
              />
            </TableCell>

            <TableCell>
              <div className="flex items-center">
                {product?.image[0] ? (
                  <Avatar
                    className="hidden p-1 mr-2 md:block bg-gray-50 shadow-none"
                    src={product?.image[0]}
                    alt="product"
                  />
                ) : (
                  <Avatar
                    src={`https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png`}
                    alt="product"
                  />
                )}
                <div>
                  <h2
                    className={`text-sm font-medium ${
                      product?.title.length > 30 ? "wrap-long-title" : ""
                    }`}
                  >
                    {showingTranslateValue(product?.title)?.substring(0, 28)}
                  </h2>
                </div>
              </div>
            </TableCell>

            <TableCell>
              <span className="text-sm">
                {showingTranslateValue(product?.category?.name)}
              </span>
            </TableCell>

            <TableCell>
              <span className="text-sm font-semibold">
                {currency}
                {product?.isCombination
                  ? getNumberTwo(product?.variants[0]?.originalPrice)
                  : getNumberTwo(product?.prices?.originalPrice)}
              </span>
            </TableCell>

            <TableCell>
              <span className="text-sm font-semibold">
                {currency}
                {product?.isCombination
                  ? getNumberTwo(product?.variants[0]?.price)
                  : getNumberTwo(product?.prices?.price)}
              </span>
            </TableCell>

            <TableCell>
              <span className="text-sm">{product.stock}</span>
            </TableCell>
            <TableCell>
              {product.stock > 0 ? (
                <Badge type="success">{t("Selling")}</Badge>
              ) : (
                <Badge type="danger">{t("SoldOut")}</Badge>
              )}
            </TableCell>
            <TableCell>
              <Link
                to={`/product/${product._id}`}
                className="flex justify-center text-gray-400 hover:text-emerald-600"
              >
                <Tooltip
                  id="view"
                  Icon={FiZoomIn}
                  title={t("DetailsTbl")}
                  bgColor="#10B981"
                />
              </Link>
            </TableCell>
            <TableCell className="text-center">
              <ShowHideButton id={product._id} status={product.status} />
              {/* {product.status} */}
            </TableCell>
            <TableCell className="text-center">
              <Badge type={approvalMeta[product.approvalStatus]?.type || "primary"}>
                {approvalMeta[product.approvalStatus]?.label ||
                  product.approvalStatus}
              </Badge>
              {canModerate && (
                <div className="flex justify-center gap-2 mt-2">
                  {product.approvalStatus !== "approved" && (
                    <button
                      type="button"
                      onClick={() => handleApprovalChange(product, "approved")}
                      disabled={
                        approvalState.id === product._id &&
                        approvalState.action === "approved"
                      }
                      className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 rounded disabled:opacity-60"
                    >
                      {approvalState.id === product._id &&
                      approvalState.action === "approved"
                        ? t("Processing") || "..."
                        : t("Approve") || "Approve"}
                    </button>
                  )}
                  {product.approvalStatus !== "rejected" && (
                    <button
                      type="button"
                      onClick={() => handleApprovalChange(product, "rejected")}
                      disabled={
                        approvalState.id === product._id &&
                        approvalState.action === "rejected"
                      }
                      className="px-3 py-1 text-xs font-semibold text-white bg-red-500 rounded disabled:opacity-60"
                    >
                      {approvalState.id === product._id &&
                      approvalState.action === "rejected"
                        ? t("Processing") || "..."
                        : t("Reject") || "Reject"}
                    </button>
                  )}
                </div>
              )}
            </TableCell>
            <TableCell>
              <EditDeleteButton
                id={product._id}
                product={product}
                isCheck={isCheck}
                handleUpdate={handleUpdate}
                handleModalOpen={handleModalOpen}
                title={showingTranslateValue(product?.title)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default ProductTable;
