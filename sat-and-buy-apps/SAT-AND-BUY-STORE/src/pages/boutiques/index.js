import { useState, useEffect } from "react";
import Link from "next/link";
import { IoSearchOutline, IoGridOutline, IoArrowForward } from "react-icons/io5";
import Layout from "@layout/Layout";
import BoutiqueCard from "@components/boutique/BoutiqueCard";
import Loading from "@components/preloader/Loading";
import BoutiqueServices from "@services/BoutiqueServices";

const BUSINESS_TYPES = [
  { value: "", label: "Toutes" },
  { value: "medical", label: "Médical" },
  { value: "it_services", label: "Services IT" },
  { value: "internet", label: "Connexion Internet" },
  { value: "clothing", label: "Vêtements & Chaussures" },
  { value: "food_beverages", label: "Jus & Alimentation" },
  { value: "naturopathy", label: "Naturopathie" },
  { value: "education", label: "Éducation" },
  { value: "beauty", label: "Beauté" },
  { value: "real_estate", label: "Immobilier" },
  { value: "transport", label: "Transport" },
  { value: "other", label: "Autre" },
];

const BoutiquesPage = () => {
  const [boutiques, setBoutiques] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchBoutiques = async (p = 1, reset = true) => {
    setLoading(true);
    try {
      const res = await BoutiqueServices.listBoutiques({ search, businessType, page: p, limit: 12 });
      if (reset) {
        setBoutiques(res.boutiques || []);
      } else {
        setBoutiques((prev) => [...prev, ...(res.boutiques || [])]);
      }
      setTotal(res.total || 0);
      setPage(p);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoutiques(1, true);
  }, [search, businessType]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <Layout title="Boutiques & Entreprises">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Boutiques & Entreprises</h1>
          <p className="text-gray-500 text-sm">
            Découvrez les entreprises locales, suivez leurs actualités et promotions.
          </p>
        </div>

        {/* CTA entreprise compact */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-white text-center sm:text-left">
            <p className="font-bold text-base sm:text-lg">Vous avez une entreprise ?</p>
            <p className="text-emerald-100 text-sm mt-0.5">
              Créez votre page gratuite et touchez vos clients directement.
            </p>
          </div>
          <Link
            href="/user/ma-boutique"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-emerald-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors text-sm shadow"
          >
            Créer ma boutique
            <IoArrowForward />
          </Link>
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 flex items-center border border-gray-200 rounded-xl bg-white px-4 py-2 gap-2">
            <IoSearchOutline className="text-gray-400 text-xl flex-shrink-0" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Rechercher une boutique..."
              className="flex-1 text-sm outline-none text-gray-700"
            />
            <button type="submit" className="text-xs text-emerald-600 font-medium">
              Chercher
            </button>
          </form>
          <select
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 bg-white outline-none"
          >
            {BUSINESS_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Résultats */}
        {loading && boutiques.length === 0 ? (
          <Loading loading={true} />
        ) : boutiques.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <IoGridOutline className="text-5xl mb-3" />
            <p className="text-lg font-medium">Aucune boutique trouvée</p>
            <p className="text-sm">Essayez d'autres filtres ou revenez plus tard.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-4">{total} boutique{total > 1 ? "s" : ""}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {boutiques.map((b) => (
                <BoutiqueCard key={b._id} boutique={b} />
              ))}
            </div>
            {boutiques.length < total && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => fetchBoutiques(page + 1, false)}
                  disabled={loading}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  {loading ? "Chargement..." : "Voir plus"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default BoutiquesPage;
