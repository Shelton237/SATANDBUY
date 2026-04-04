import { useState, useEffect } from "react";
import Link from "next/link";
import { IoAlertCircleOutline, IoSettingsOutline } from "react-icons/io5";
import ProductServices from "@services/ProductServices";
import Loading from "@components/preloader/Loading";

const TYPE_LABELS = { physical: "Produit", service: "Service" };

const BoutiqueProductCard = ({ product }) => {
  const title =
    typeof product.title === "string"
      ? product.title
      : product.title?.fr || product.title?.en || "Sans titre";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className="relative bg-gray-100" style={{ paddingBottom: "60%" }}>
        {product.image?.[0] ? (
          <img
            src={product.image[0]}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-4xl">
            {product.type === "service" ? "🛠" : "📦"}
          </div>
        )}
        <span className="absolute top-2 left-2 text-xs bg-white/90 text-gray-700 px-2 py-0.5 rounded-full font-medium shadow-sm">
          {TYPE_LABELS[product.type] || product.type}
        </span>
      </div>

      <div className="p-3 flex-1 flex flex-col gap-1">
        <p className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">{title}</p>
        {product.prices?.price != null && (
          <p className="text-emerald-600 font-bold text-sm mt-auto">
            {Number(product.prices.price).toLocaleString("fr-FR")} FCFA
          </p>
        )}
      </div>
    </div>
  );
};

const CatalogSection = ({ boutique, isOwner }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!boutique?._id) return;
    setLoading(true);
    ProductServices.getBoutiqueStoreProducts({ boutiqueId: boutique._id, limit: 50 })
      .then((res) => setProducts(res.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [boutique?._id]);

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-500 text-sm">
          {products.length} article{products.length !== 1 ? "s" : ""}
        </p>
        {isOwner && (
          <Link
            href="/user/boutique/catalog"
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <IoSettingsOutline className="text-lg" />
            Gérer le catalogue
          </Link>
        )}
      </div>

      {loading ? (
        <Loading loading={true} />
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <IoAlertCircleOutline className="text-4xl mb-2" />
          <p className="text-sm">Aucun article dans le catalogue pour l'instant.</p>
          {isOwner && (
            <Link
              href="/user/boutique/catalog"
              className="mt-3 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-600 transition-colors"
            >
              Soumettre votre premier produit
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {products.map((product) => (
            <BoutiqueProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CatalogSection;
