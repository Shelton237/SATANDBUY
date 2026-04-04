import dynamic from "next/dynamic";
import { useState, useEffect, useContext } from "react";
import Link from "next/link";
import {
  IoListOutline, IoStorefrontOutline, IoPeopleOutline,
  IoCheckmarkCircleOutline, IoTimeOutline, IoCloseCircleOutline,
  IoArrowForwardOutline,
} from "react-icons/io5";
import BoutiqueDashboardLayout, { TYPE_CONFIG } from "@components/boutique/BoutiqueDashboardLayout";
import BoutiqueServices from "@services/BoutiqueServices";
import ProductServices from "@services/ProductServices";
import { UserContext } from "@context/UserContext";

const StatCard = ({ icon: Icon, label, value, color, href }) => (
  <Link href={href || "#"} className={`bg-white rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow ${!href ? "cursor-default" : ""}`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="text-xl text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value ?? "—"}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  </Link>
);

const BoutiqueDashboardPage = () => {
  const { state: { userInfo } } = useContext(UserContext);
  const [boutique, setBoutique] = useState(null);
  const [orders, setOrders] = useState({ total: 0, pending: 0, confirmed: 0, cancelled: 0 });
  const [catalogCount, setCatalogCount] = useState(0);
  const [featuredCount, setFeaturedCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userInfo) return;
    const load = async () => {
      try {
        const boutiqueRes = await BoutiqueServices.getMyBoutique();
        const b = boutiqueRes.boutique;
        setBoutique(b);
        if (!b) return;

        const [ordersRes, submissionsRes, approvedRes] = await Promise.all([
          BoutiqueServices.getBoutiqueReceivedOrders({ limit: 5 }),
          ProductServices.getMySubmissions({ limit: 1 }),
          ProductServices.getMySubmissions({ limit: 1, approvalStatus: "approved" }),
        ]);

        const allOrders = ordersRes.orders || [];
        setRecentOrders(allOrders);
        setOrders({
          total: ordersRes.total || 0,
          pending: allOrders.filter((o) => o.status === "pending").length,
          confirmed: allOrders.filter((o) => o.status === "confirmed").length,
          cancelled: allOrders.filter((o) => o.status === "cancelled").length,
        });

        setCatalogCount(submissionsRes.totalDoc || 0);
        setFeaturedCount(approvedRes.totalDoc || 0);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userInfo]);

  const config = boutique ? (TYPE_CONFIG[boutique.businessType] || TYPE_CONFIG.other) : TYPE_CONFIG.other;
  const STATUS_COLORS = { pending: "text-orange-500", confirmed: "text-emerald-500", completed: "text-blue-500", cancelled: "text-red-400" };
  const STATUS_LABELS = { pending: "En attente", confirmed: "Confirmé", completed: "Terminé", cancelled: "Annulé" };

  return (
    <BoutiqueDashboardLayout title="Vue d'ensemble">
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-gray-800">Vue d'ensemble</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={IoListOutline}
            label={`Total ${config.ordersLabel}`}
            value={orders.total}
            color="bg-emerald-500"
            href="/user/boutique/orders"
          />
          <StatCard
            icon={IoTimeOutline}
            label="En attente"
            value={orders.pending}
            color="bg-orange-400"
            href="/user/boutique/orders?status=pending"
          />
          <StatCard
            icon={IoStorefrontOutline}
            label={`Articles catalogue`}
            value={catalogCount}
            color="bg-indigo-500"
            href="/user/boutique/catalog"
          />
          <StatCard
            icon={IoPeopleOutline}
            label="Mis en avant"
            value={featuredCount}
            color="bg-teal-500"
            href="/user/boutique/catalog"
          />
        </div>

        {/* Commandes récentes */}
        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">
              {config.ordersLabel} récentes
            </h2>
            <Link href="/user/boutique/orders" className="text-xs text-emerald-600 flex items-center gap-1 hover:underline">
              Voir tout <IoArrowForwardOutline />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-10 text-center text-gray-400">
              <IoListOutline className="text-4xl mx-auto mb-2" />
              <p className="text-sm">Aucune commande reçue pour l'instant.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  {order.catalogItemId?.images?.[0] ? (
                    <img src={order.catalogItemId.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                      {order.catalogItemId?.type === "service" ? "🛠" : "📦"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {order.catalogItemId?.name || "Article supprimé"}
                    </p>
                    <p className="text-xs text-gray-400">
                      Qté : {order.quantity} — {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <span className={`text-xs font-medium flex-shrink-0 ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accès rapide boutique publique */}
        {boutique && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-5 text-white flex items-center justify-between">
            <div>
              <p className="font-semibold">Votre boutique publique</p>
              <p className="text-sm text-white/80 mt-0.5">
                {boutique.followersCount || 0} abonné{boutique.followersCount !== 1 ? "s" : ""}
              </p>
            </div>
            <Link
              href={`/boutiques/${boutique.slug}`}
              className="bg-white text-emerald-600 font-medium text-sm px-4 py-2 rounded-xl hover:bg-emerald-50 transition-colors"
            >
              Voir ma page
            </Link>
          </div>
        )}
      </div>
    </BoutiqueDashboardLayout>
  );
};

export default dynamic(() => Promise.resolve(BoutiqueDashboardPage), { ssr: false });
