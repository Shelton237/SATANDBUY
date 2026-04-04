import Image from "next/image";
import Link from "next/link";
import { IoBriefcaseOutline, IoCheckmarkCircle, IoPeopleOutline } from "react-icons/io5";

const BUSINESS_TYPE_LABELS = {
  medical: "Médical",
  it_services: "Services IT",
  internet: "Connexion Internet",
  clothing: "Vêtements & Chaussures",
  food_beverages: "Jus & Alimentation",
  naturopathy: "Naturopathie",
  education: "Éducation",
  beauty: "Beauté",
  real_estate: "Immobilier",
  transport: "Transport",
  other: "Autre",
};

const BoutiqueCard = ({ boutique }) => {
  const typeLabel = BUSINESS_TYPE_LABELS[boutique.businessType] || "Boutique";

  return (
    <Link href={`/boutiques/${boutique.slug}`}>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer border border-gray-100">
        {/* Cover image */}
        <div className="relative h-28 bg-gradient-to-r from-emerald-400 to-teal-500">
          {boutique.coverImage ? (
            <Image
              src={boutique.coverImage}
              alt={boutique.name}
              fill
              className="object-cover"
            />
          ) : null}
        </div>

        {/* Logo */}
        <div className="px-4 pb-4">
          <div className="relative -mt-8 mb-2">
            <div className="w-16 h-16 rounded-full border-4 border-white bg-white shadow overflow-hidden flex items-center justify-center">
              {boutique.logo ? (
                <Image
                  src={boutique.logo}
                  alt={boutique.name}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              ) : (
                <IoBriefcaseOutline className="text-emerald-500 text-2xl" />
              )}
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="font-semibold text-gray-800 truncate text-sm">{boutique.name}</h3>
                {boutique.verified && (
                  <IoCheckmarkCircle className="text-emerald-500 text-base flex-shrink-0" />
                )}
              </div>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {typeLabel}
              </span>
            </div>
          </div>

          {boutique.description && (
            <p className="text-gray-500 text-xs mt-2 line-clamp-2">{boutique.description}</p>
          )}

          <div className="flex items-center gap-1 mt-2 text-gray-400 text-xs">
            <IoPeopleOutline />
            <span>{boutique.followersCount || 0} abonné{boutique.followersCount !== 1 ? "s" : ""}</span>
            {boutique.city && <span>• {boutique.city}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BoutiqueCard;
