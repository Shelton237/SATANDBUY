import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Button } from "@windmill/react-ui";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiRefreshCcw } from "react-icons/fi";

import PageTitle from "@/components/Typography/PageTitle";
import AnimatedContent from "@/components/common/AnimatedContent";
import OrderServices from "@/services/OrderServices";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import { notifyError } from "@/utils/toast";
import { AdminContext } from "@/context/AdminContext";

const KANBAN_COLUMNS = [
  { key: "Pending", title: "Nouvelles commandes" },
  { key: "Sorting", title: "Tri en cours" },
  { key: "ReadyForDelivery", title: "Prêtes pour planification" },
  { key: "Processing", title: "Livraison planifiée" },
  { key: "Delivered", title: "Livrées" },
  { key: "Cancel", title: "Annulées" },
];

const OrderBoard = () => {
  const { t } = useTranslation();
  const { currency, getNumberTwo, showDateTimeFormat } = useUtilsFunction();
  const { authData } = useContext(AdminContext);
  const [board, setBoard] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const currentUser = authData?.user || authData || null;
  const currentRole = currentUser?.role;

  const isDriver = currentRole === "Livreur";

  const driverIdentifiers = useMemo(() => {
    if (!isDriver) return [];
    const candidates = [
      currentUser?.name,
      currentUser?.email,
      currentUser?.id,
      currentUser?._id,
    ];
    return candidates
      .map((value) => {
        if (!value) return "";
        if (typeof value === "string") return value;
        if (typeof value === "number") return value.toString();
        return value?.toString?.() || "";
      })
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
  }, [currentRole, currentUser]);

  const filterBoardForDriver = useCallback(
    (rawBoard = {}) => {
      if (!isDriver) {
        return rawBoard;
      }
      const filtered = {};
      Object.entries(rawBoard).forEach(([status, orders]) => {
        const list = Array.isArray(orders) ? orders : [];
        filtered[status] =
          driverIdentifiers.length === 0
            ? []
            : list.filter((order) => {
                const assigned = order?.deliveryPlan?.assignedDriver;
                if (!assigned) return false;
                const normalized = assigned.toString().trim().toLowerCase();
                return driverIdentifiers.some((identifier) =>
                  normalized.includes(identifier)
                );
              });
      });
      return filtered;
    },
    [isDriver, driverIdentifiers]
  );

  const fetchBoard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await OrderServices.getOrdersBoard({ limit: 25 });
      const filtered = filterBoardForDriver(res?.board || {});
      setBoard(filtered);
      setLastUpdated(new Date());
    } catch (err) {
      const message = err?.response?.data?.message || err?.message;
      setError(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  }, [filterBoardForDriver]);

  useEffect(() => {
    fetchBoard();
    const interval = setInterval(fetchBoard, 60000);
    return () => clearInterval(interval);
  }, [fetchBoard]);

  const formattedUpdatedAt = useMemo(
    () => (lastUpdated ? showDateTimeFormat(lastUpdated) : "—"),
    [lastUpdated, showDateTimeFormat]
  );

  const renderCard = (order) => {
    const userInfo = order?.user_info || {};
    const contactName = userInfo.name || "—";
    const contactPhone = userInfo.contact || "—";
    const contactAddress =
      [userInfo.address, userInfo.city, userInfo.country]
        .filter(Boolean)
        .join(", ") || "Adresse non communiquée";

    return (
      <div
        key={order._id}
        className="p-3 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-2"
      >
        <div className="flex justify-between text-sm font-semibold text-gray-700 dark:text-gray-200">
          <span>#{order.invoice}</span>
          <span>
            {currency}
            {getNumberTwo(order.total)}
          </span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>Client : {contactName}</p>
          <p>Tri : {order?.sorting?.status || "—"}</p>
          <p>
            Livre. :{" "}
            {order?.deliveryPlan?.assignedDriver
              ? order.deliveryPlan.assignedDriver
              : "Non assigné"}
          </p>
          {order?.deliveryPlan?.deliveryDate && (
            <p>
              Date : {showDateTimeFormat(order.deliveryPlan.deliveryDate)}
            </p>
          )}
          <p>Maj : {showDateTimeFormat(order.updatedAt)}</p>
          {isDriver && (
            <div className="mt-2 p-2 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-100">
              <p className="font-semibold text-[11px] uppercase tracking-wide">
                Coordonnées client
              </p>
              <p className="text-[12px]">Tel : {contactPhone}</p>
              <p className="text-[12px] leading-snug">
                Adresse : {contactAddress}
              </p>
            </div>
          )}
        </div>
        <Link
          to={`/order/${order._id}`}
          className="text-xs font-semibold text-emerald-600 hover:underline"
        >
          {t("ViewOrder", "Voir la commande")}
        </Link>
      </div>
    );
  };

  return (
    <>
      <PageTitle>Kanban Livraisons</PageTitle>
      <AnimatedContent>
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Dernière mise à jour : {formattedUpdatedAt}
          </div>
          <Button
            size="small"
            onClick={fetchBoard}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <FiRefreshCcw />
            Rafraîchir
          </Button>
        </div>

        {isDriver && (
          <div
            className={`mb-4 text-sm ${
              driverIdentifiers.length ? "text-emerald-600" : "text-amber-600"
            }`}
          >
            {driverIdentifiers.length
              ? "Mode livreur activé : seules vos commandes assignées s'affichent."
              : "Aucun identifiant livreur détecté. Ajoutez votre nom ou email dans le plan de livraison pour être assigné."}
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {KANBAN_COLUMNS.map((column) => {
            const columnOrders = board[column.key] || [];
            return (
              <div
                key={column.key}
                className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg max-h-[80vh]"
              >
                <header className="p-4 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                    {column.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {columnOrders.length} commande(s)
                  </p>
                </header>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {columnOrders.length === 0 ? (
                    <p className="text-sm text-gray-400">
                      {loading ? "Chargement..." : "Aucune commande"}
                    </p>
                  ) : (
                    columnOrders.map((order) => renderCard(order))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </AnimatedContent>
    </>
  );
};

export default OrderBoard;
