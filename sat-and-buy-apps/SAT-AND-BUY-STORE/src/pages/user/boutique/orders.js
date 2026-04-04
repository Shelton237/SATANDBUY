import dynamic from "next/dynamic";
import { useState, useEffect, useContext } from "react";
import { IoListOutline, IoReceiptOutline } from "react-icons/io5";
import BoutiqueDashboardLayout, { TYPE_CONFIG } from "@components/boutique/BoutiqueDashboardLayout";
import BoutiqueServices from "@services/BoutiqueServices";
import OrderServices from "@services/OrderServices";
import { UserContext } from "@context/UserContext";

const STATUS_CONFIG = {
  Pending:          { label: "En attente",        color: "bg-orange-100 text-orange-600" },
  Sorting:          { label: "En traitement",     color: "bg-yellow-100 text-yellow-700" },
  ReadyForDelivery: { label: "Prêt à livrer",     color: "bg-blue-100 text-blue-700" },
  Processing:       { label: "En livraison",      color: "bg-indigo-100 text-indigo-600" },
  Delivered:        { label: "Livré",             color: "bg-emerald-100 text-emerald-700" },
  Cancel:           { label: "Annulé",            color: "bg-red-100 text-red-500" },
};

const BoutiqueOrdersPage = () => {
  const { state: { userInfo } } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [boutique, setBoutique] = useState(null);
  const LIMIT = 10;

  useEffect(() => {
    if (!userInfo) return;
    BoutiqueServices.getMyBoutique()
      .then((r) => setBoutique(r.boutique || null))
      .catch(() => {});
  }, [userInfo]);

  const fetchOrders = async (p = 1) => {
    if (!boutique?._id) return;
    setLoading(true);
    try {
      const res = await OrderServices.getBoutiqueOrders({
        boutiqueId: boutique._id,
        page: p,
        limit: LIMIT,
        status: statusFilter,
      });
      setOrders(res.orders || []);
      setTotal(res.total || 0);
      setPage(p);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (boutique?._id) fetchOrders(1);
  }, [boutique, statusFilter]);

  const getBoutiqueItems = (order) =>
    (order.cart || []).filter((item) => String(item.boutiqueId) === String(boutique?._id));

  const getTitle = (item) => {
    if (!item.title) return item.name || "Produit";
    if (typeof item.title === "string") return item.title;
    return item.title.fr || item.title.en || "Produit";
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
            { value: "Pending", label: "En attente" },
            { value: "Sorting", label: "En traitement" },
            { value: "Processing", label: "En livraison" },
            { value: "Delivered", label: "Livrées" },
            { value: "Cancel", label: "Annulées" },
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
            orders.map((order) => {
              const boutiqueItems = getBoutiqueItems(order);
              const statusCfg = STATUS_CONFIG[order.status] || { label: order.status, color: "bg-gray-100 text-gray-600" };
              return (
                <div key={order._id} className="bg-white rounded-2xl p-4 space-y-3">
                  {/* Header commande */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IoReceiptOutline className="text-gray-400" />
                      <span className="text-sm font-semibold text-gray-700">
                        Commande #{order.invoice || order._id?.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400">
                        · {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Client */}
                  {order.user_info?.name && (
                    <p className="text-xs text-gray-500">
                      Client : {order.user_info.name}
                      {order.user_info.email && ` · ${order.user_info.email}`}
                    </p>
                  )}

                  {/* Articles de cette boutique */}
                  <div className="space-y-2">
                    {boutiqueItems.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Aucun article trouvé dans cette commande.</p>
                    ) : boutiqueItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        {item.image?.[0] || item.image ? (
                          <img
                            src={Array.isArray(item.image) ? item.image[0] : item.image}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                            {item.type === "service" ? "🛠" : "📦"}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{getTitle(item)}</p>
                          <p className="text-xs text-gray-400">
                            Qté : {item.quantity}
                            {item.price != null && (
                              <> · {(item.price * item.quantity).toLocaleString("fr-FR")} FCFA</>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
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
