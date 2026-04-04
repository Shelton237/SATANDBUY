import dynamic from "next/dynamic";
import { useState, useEffect, useContext } from "react";
import { IoListOutline, IoCheckmarkOutline, IoCloseOutline, IoTimeOutline } from "react-icons/io5";
import BoutiqueDashboardLayout, { TYPE_CONFIG } from "@components/boutique/BoutiqueDashboardLayout";
import BoutiqueServices from "@services/BoutiqueServices";
import { UserContext } from "@context/UserContext";
import { notifyError, notifySuccess } from "@utils/toast";

const STATUS_CONFIG = {
  pending:   { label: "En attente",  color: "bg-orange-100 text-orange-600" },
  confirmed: { label: "Confirmé",    color: "bg-emerald-100 text-emerald-700" },
  completed: { label: "Terminé",     color: "bg-blue-100 text-blue-700" },
  cancelled: { label: "Annulé",      color: "bg-red-100 text-red-500" },
};

const BoutiqueOrdersPage = () => {
  const { state: { userInfo } } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [boutique, setBoutique] = useState(null);
  const LIMIT = 10;

  useEffect(() => {
    if (!userInfo) return;
    BoutiqueServices.getMyBoutique()
      .then((r) => setBoutique(r.boutique || null))
      .catch(() => {});
  }, [userInfo]);

  const fetchOrders = async (p = 1) => {
    setLoading(true);
    try {
      const res = await BoutiqueServices.getBoutiqueReceivedOrders({
        page: p, limit: LIMIT, status: statusFilter,
      });
      setOrders(res.orders || []);
      setTotal(res.total || 0);
      setPage(p);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(1); }, [statusFilter, userInfo]);

  const handleStatus = async (orderId, status) => {
    setActionLoading(orderId + status);
    try {
      await BoutiqueServices.updateBoutiqueOrderStatus(orderId, status);
      notifySuccess("Statut mis à jour.");
      fetchOrders(page);
    } catch (err) {
      notifyError(err?.response?.data?.message || "Erreur.");
    } finally {
      setActionLoading(null);
    }
  };

  const config = boutique ? (TYPE_CONFIG[boutique.businessType] || TYPE_CONFIG.other) : TYPE_CONFIG.other;
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <BoutiqueDashboardLayout title={config.ordersLabel}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">{config.ordersLabel}</h1>
          <span className="text-sm text-gray-400">{total} au total</span>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "", label: "Toutes" },
            { value: "pending", label: "En attente" },
            { value: "confirmed", label: "Confirmées" },
            { value: "completed", label: "Terminées" },
            { value: "cancelled", label: "Annulées" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Liste */}
        <div className="space-y-3">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 h-24 animate-pulse bg-gray-100" />
            ))
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-gray-400">
              <IoListOutline className="text-4xl mx-auto mb-2" />
              <p className="text-sm">Aucune commande trouvée.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
                {/* Article */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {order.catalogItemId?.images?.[0] ? (
                    <img
                      src={order.catalogItemId.images[0]}
                      alt=""
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                      {order.catalogItemId?.type === "service" ? "🛠" : "📦"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">
                      {order.catalogItemId?.name || "Article supprimé"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Qté : {order.quantity}
                      {order.unitPrice != null && (
                        <> · {(order.unitPrice * order.quantity).toLocaleString("fr-FR")} {order.currency}</>
                      )}
                    </p>
                    {order.note && (
                      <p className="text-xs text-gray-500 mt-1 italic">"{order.note}"</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {order.customerName || order.customerEmail || "Client anonyme"} · {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>

                {/* Statut + actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_CONFIG[order.status]?.color}`}>
                    {STATUS_CONFIG[order.status]?.label}
                  </span>

                  {order.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleStatus(order._id, "confirmed")}
                        disabled={!!actionLoading}
                        className="flex items-center gap-1 text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <IoCheckmarkOutline /> Confirmer
                      </button>
                      <button
                        onClick={() => handleStatus(order._id, "cancelled")}
                        disabled={!!actionLoading}
                        className="flex items-center gap-1 text-xs border border-red-200 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <IoCloseOutline /> Refuser
                      </button>
                    </>
                  )}

                  {order.status === "confirmed" && (
                    <button
                      onClick={() => handleStatus(order._id, "completed")}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1 text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <IoCheckmarkOutline /> Terminer
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => fetchOrders(i + 1)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  page === i + 1
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </BoutiqueDashboardLayout>
  );
};

export default dynamic(() => Promise.resolve(BoutiqueOrdersPage), { ssr: false });
