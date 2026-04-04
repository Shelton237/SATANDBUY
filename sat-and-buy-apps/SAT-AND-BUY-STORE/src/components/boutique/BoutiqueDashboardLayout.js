import { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  IoGridOutline, IoListOutline, IoStorefrontOutline,
  IoOpenOutline, IoPencilOutline, IoStatsChartOutline,
} from "react-icons/io5";
import Layout from "@layout/Layout";
import Loading from "@components/preloader/Loading";
import BoutiqueServices from "@services/BoutiqueServices";
import { UserContext } from "@context/UserContext";
import { useRouter as useNextRouter } from "next/router";

// Labels adaptés au type d'entreprise
const TYPE_CONFIG = {
  medical: {
    label: "Cabinet Médical",
    ordersLabel: "Consultations",
    catalogLabel: "Soins & Tarifs",
    icon: "🏥",
  },
  it_services: {
    label: "Services IT",
    ordersLabel: "Missions",
    catalogLabel: "Prestations",
    icon: "💻",
  },
  internet: {
    label: "Vente Internet",
    ordersLabel: "Abonnements",
    catalogLabel: "Offres",
    icon: "📡",
  },
  clothing: {
    label: "Boutique Mode",
    ordersLabel: "Commandes",
    catalogLabel: "Articles",
    icon: "👗",
  },
  food_beverages: {
    label: "Alimentation",
    ordersLabel: "Commandes",
    catalogLabel: "Produits",
    icon: "🥗",
  },
  naturopathy: {
    label: "Naturopathie",
    ordersLabel: "Rendez-vous",
    catalogLabel: "Soins",
    icon: "🌿",
  },
  education: {
    label: "Centre Éducatif",
    ordersLabel: "Inscriptions",
    catalogLabel: "Formations",
    icon: "📚",
  },
  beauty: {
    label: "Beauté & Bien-être",
    ordersLabel: "Réservations",
    catalogLabel: "Prestations",
    icon: "💆",
  },
  real_estate: {
    label: "Immobilier",
    ordersLabel: "Demandes",
    catalogLabel: "Propriétés",
    icon: "🏠",
  },
  transport: {
    label: "Transport",
    ordersLabel: "Courses",
    catalogLabel: "Véhicules & Tarifs",
    icon: "🚗",
  },
  other: {
    label: "Entreprise",
    ordersLabel: "Commandes",
    catalogLabel: "Catalogue",
    icon: "🏢",
  },
};

const BoutiqueDashboardLayout = ({ children, title }) => {
  const router = useNextRouter();
  const { state: { userInfo } } = useContext(UserContext);
  const [boutique, setBoutique] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userInfo) return;
    BoutiqueServices.getMyBoutique()
      .then((res) => setBoutique(res.boutique || null))
      .catch(() => setBoutique(null))
      .finally(() => setLoading(false));
  }, [userInfo]);

  useEffect(() => {
    if (!loading && !boutique) {
      router.replace("/user/ma-boutique");
    }
  }, [loading, boutique]);

  if (loading) return <Layout><Loading loading={true} /></Layout>;
  if (!boutique) return null;

  const config = TYPE_CONFIG[boutique.businessType] || TYPE_CONFIG.other;

  const navItems = [
    {
      href: "/user/boutique",
      label: "Vue d'ensemble",
      icon: IoGridOutline,
    },
    {
      href: "/user/boutique/orders",
      label: config.ordersLabel,
      icon: IoListOutline,
    },
    {
      href: "/user/boutique/catalog",
      label: config.catalogLabel,
      icon: IoStorefrontOutline,
    },
  ];

  return (
    <Layout title={title || `${config.label} — ${boutique.name}`}>
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-10 py-10">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar */}
          <aside className="flex-shrink-0 w-full lg:w-72">
            <div className="bg-white rounded-2xl p-5 sticky top-28">
              {/* Identité boutique */}
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl flex-shrink-0">
                  {boutique.logo ? (
                    <img src={boutique.logo} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    config.icon
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{boutique.name}</p>
                  <p className="text-xs text-emerald-600">{config.label}</p>
                  {boutique.verified && (
                    <span className="text-xs text-emerald-500">✓ Vérifié</span>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const active = router.pathname === item.href || router.asPath === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        active
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                      }`}
                    >
                      <item.icon className={`text-lg flex-shrink-0 ${active ? "text-emerald-600" : "text-gray-400"}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Actions rapides */}
              <div className="mt-6 pt-5 border-t border-gray-100 space-y-2">
                <Link
                  href={`/boutiques/${boutique.slug}`}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-emerald-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <IoOpenOutline className="text-base" />
                  Voir ma boutique publique
                </Link>
                <Link
                  href="/user/ma-boutique"
                  className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-emerald-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <IoPencilOutline className="text-base" />
                  Modifier les informations
                </Link>
              </div>
            </div>
          </aside>

          {/* Contenu principal */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </Layout>
  );
};

export { TYPE_CONFIG };
export default BoutiqueDashboardLayout;
