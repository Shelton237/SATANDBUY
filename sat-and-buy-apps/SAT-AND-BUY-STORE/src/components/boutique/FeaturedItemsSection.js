import Link from "next/link";
import { IoArrowForward } from "react-icons/io5";
import FeaturedItemCard from "./FeaturedItemCard";

const FeaturedItemsSection = ({ initialItems = [] }) => {
  const items = initialItems;
  const loading = false;

  if (items.length === 0) return null;

  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Produits & Services en vedette</h2>
            <p className="text-sm text-gray-500 mt-0.5">Offres sélectionnées par nos entreprises partenaires</p>
          </div>
          <Link
            href="/marche"
            className="flex items-center gap-1 text-sm text-brand-blue hover:text-brand-blue-dark font-medium"
          >
            Voir tout <IoArrowForward />
          </Link>
        </div>

        {/* Grille */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="bg-gray-200" style={{ paddingBottom: "65%" }} />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-7 bg-gray-200 rounded-xl mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {items.map((item) => (
              <FeaturedItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedItemsSection;
