import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  IoBagAddSharp,
  IoAdd,
  IoRemove,
  IoTimeOutline,
  IoDesktopOutline,
  IoLocationOutline,
  IoSwapHorizontalOutline,
} from "react-icons/io5";
import { useCart } from "react-use-cart";

import { notifyError } from "@utils/toast";
import useAddToCart from "@hooks/useAddToCart";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import ProductModal from "@components/modal/ProductModal";
import ImageWithFallback from "@components/common/ImageWithFallBack";
import { handleLogEvent } from "src/lib/analytics";

const PLACEHOLDER =
  "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png";

const DELIVERY_LABELS = {
  onsite: { label: "Sur site", Icon: IoLocationOutline },
  online: { label: "En ligne", Icon: IoDesktopOutline },
  hybrid: { label: "Hybride", Icon: IoSwapHorizontalOutline },
};

const DURATION_SHORT = { minutes: "min", hours: "h", days: "j" };

const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n || 0);

const ProductCard = ({ product, attributes }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const { items, addItem, updateItemQuantity, inCart } = useCart();
  const { handleIncreaseQuantity } = useAddToCart();
  const { globalSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();

  const currency = globalSetting?.default_currency || "FCFA";
  const isService = product?.type === "service";
  const isOutOfStock = !isService && product.stock <= 0;
  const sd = product?.serviceDetails;
  const modeInfo = sd?.deliveryMode ? DELIVERY_LABELS[sd.deliveryMode] : null;

  const title = showingTranslateValue(product?.title) || "—";
  const rawPrice = product?.isCombination
    ? product?.variants?.[0]?.price
    : product?.prices?.price;
  const rawOriginal = product?.isCombination
    ? product?.variants?.[0]?.originalPrice
    : product?.prices?.originalPrice;
  const hasDiscount = rawOriginal && rawOriginal > rawPrice;
  const discountPct =
    hasDiscount ? Math.round((1 - rawPrice / rawOriginal) * 100) : 0;

  const handleAddItem = () => {
    if (isService) {
      const { slug, variants, categories, description, ...rest } = product;
      addItem({ ...rest, title, id: product._id, variant: product.prices, price: rawPrice, originalPrice: rawOriginal });
      return;
    }
    if (product.stock < 1) return notifyError("Stock insuffisant !");
    if (product?.variants?.length > 0) {
      setModalOpen(true);
      handleLogEvent("product", `opened ${title} product modal`);
      return;
    }
    const { slug, variants, categories, description, ...rest } = product;
    addItem({ ...rest, title, id: product._id, variant: product.prices, price: rawPrice, originalPrice: rawOriginal });
  };

  return (
    <>
      {modalOpen && !isService && (
        <ProductModal
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          product={product}
          currency={currency}
          attributes={attributes}
        />
      )}

      <div
        className={`group bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col overflow-hidden${
          isOutOfStock ? " opacity-60" : ""
        }`}
      >
        {/* ── IMAGE ── */}
        <div
          className="relative bg-gray-50 overflow-hidden cursor-pointer"
          style={{ paddingBottom: "100%" }}
          onClick={() => {
            if (!isService) {
              setModalOpen(true);
              handleLogEvent("product", `opened ${title} product modal`);
            }
          }}
        >
          <div className="absolute inset-0 p-3 flex items-center justify-center">
            {product?.image?.[0] ? (
              <ImageWithFallback
                src={product.image[0]}
                alt={title}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <Image
                src={PLACEHOLDER}
                alt={title}
                fill
                sizes="100%"
                className="object-contain p-4"
              />
            )}
          </div>

          {/* Discount badge */}
          {discountPct > 0 && (
            <span className="absolute top-2 left-2 bg-brand-coral text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm leading-none">
              -{discountPct}%
            </span>
          )}

          {/* Service badge */}
          {isService && (
            <span className="absolute top-2 right-2 bg-brand-blue text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide leading-none">
              Service
            </span>
          )}

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded">
                Indisponible
              </span>
            </div>
          )}
        </div>

        {/* ── CONTENU ── */}
        <div className="p-3 flex flex-col flex-1 gap-2">
          {/* Meta : unité ou mode livraison */}
          <p className="text-[10px] text-gray-400 uppercase tracking-wide truncate leading-none">
            {isService && modeInfo ? (
              <span className="flex items-center gap-0.5 normal-case text-brand-blue">
                <modeInfo.Icon size={9} />
                {modeInfo.label}
                {sd?.durationValue && (
                  <span className="ml-1 text-gray-400 normal-case">
                    · {sd.durationValue}&nbsp;
                    {DURATION_SHORT[sd.durationUnit] || sd.durationUnit}
                  </span>
                )}
              </span>
            ) : product?.unit ? (
              product.unit
            ) : (
              <span className="invisible">-</span>
            )}
          </p>

          {/* Titre */}
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug flex-1 group-hover:text-brand-blue transition-colors">
            {title}
          </h3>

          {/* Prix */}
          <div className="flex items-baseline gap-1.5">
            {!rawPrice || rawPrice === 0 ? (
              <span className="text-xs text-gray-400 italic">Prix sur devis</span>
            ) : (
              <>
                <span className="text-base font-bold text-gray-900 leading-none">
                  {fmt(rawPrice)}{" "}
                  <span className="text-xs font-normal text-gray-500">
                    {currency}
                  </span>
                </span>
                {hasDiscount && (
                  <del className="text-xs text-gray-400">
                    {fmt(rawOriginal)}
                  </del>
                )}
              </>
            )}
          </div>

          {/* CTA */}
          {isService ? (
            inCart(product._id) ? (
              <div>
                {items.map(
                  (item) =>
                    item.id === product._id && (
                      <div key={item.id} className="flex items-center justify-between w-full bg-brand-blue text-white rounded-lg px-3 py-1.5">
                        <button onClick={() => updateItemQuantity(item.id, item.quantity - 1)} className="text-base font-bold leading-none"><IoRemove /></button>
                        <span className="text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => handleAddItem()} className="text-base font-bold leading-none"><IoAdd /></button>
                      </div>
                    )
                )}
              </div>
            ) : (
              <button
                onClick={handleAddItem}
                aria-label="Commander ce service"
                className="w-full py-2 bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <IoBagAddSharp className="w-3.5 h-3.5" />
                Commander
              </button>
            )
          ) : isOutOfStock ? (
            <div className="w-full py-2 text-center text-xs font-semibold text-gray-400 border border-gray-200 rounded-lg">
              Indisponible
            </div>
          ) : inCart(product._id) ? (
            <div>
              {items.map(
                (item) =>
                  item.id === product._id && (
                    <div
                      key={item.id}
                      className="flex items-center justify-between w-full bg-brand-blue text-white rounded-lg px-3 py-1.5"
                    >
                      <button
                        onClick={() =>
                          updateItemQuantity(item.id, item.quantity - 1)
                        }
                        className="text-base font-bold leading-none"
                      >
                        <IoRemove />
                      </button>
                      <span className="text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() =>
                          item?.variants?.length > 0
                            ? handleAddItem()
                            : handleIncreaseQuantity(item)
                        }
                        className="text-base font-bold leading-none"
                      >
                        <IoAdd />
                      </button>
                    </div>
                  )
              )}
            </div>
          ) : (
            <button
              onClick={handleAddItem}
              aria-label="Ajouter au panier"
              className="w-full py-2 bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <IoBagAddSharp className="w-3.5 h-3.5" />
              Ajouter
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductCard;
