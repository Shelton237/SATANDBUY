import { useState, useEffect, useCallback } from "react";
import { IoSearchOutline } from "react-icons/io5";
import Layout from "@layout/Layout";
import ProductCard from "@components/product/ProductCard";
import Loading from "@components/preloader/Loading";
import ProductServices from "@services/ProductServices";

const LIMIT = 18;

const Marche = () => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchProducts = useCallback(
    async (p = 1, reset = true) => {
      p === 1 ? setLoading(true) : setLoadingMore(true);
      try {
        const res = await ProductServices.getBoutiqueStoreProducts({ page: p, limit: LIMIT, type });
        setProducts((prev) => (reset ? res.products || [] : [...prev, ...(res.products || [])]));
        setTotal(res.totalDoc || 0);
        setPage(p);
      } catch {
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [type]
  );

  useEffect(() => {
    fetchProducts(1, true);
  }, [fetchProducts]);

  return (
    <Layout title="Marché — Produits & Services">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        {/* Titre */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Marché des entreprises</h1>
          <p className="text-gray-500 text-sm mt-1">
            Produits et services validés par nos entreprises partenaires
          </p>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { label: "Tout", value: "" },
            { label: "Produits", value: "physical" },
            { label: "Services", value: "service" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setType(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                type === f.value
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto text-sm text-gray-400 self-center">
            {total} article{total > 1 ? "s" : ""}
          </span>
        </div>

        {/* Grille */}
        {loading ? (
          <Loading loading={true} />
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <IoSearchOutline className="text-5xl mb-3" />
            <p className="text-sm">Aucun article disponible pour l'instant.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {products.length < total && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => fetchProducts(page + 1, false)}
                  disabled={loadingMore}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {loadingMore ? "Chargement…" : "Voir plus"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Marche;
