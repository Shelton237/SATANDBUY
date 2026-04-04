import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { IoAdd, IoBagAddSharp, IoRemove, IoTimeOutline, IoLocationOutline, IoDesktopOutline, IoPersonOutline, IoSwapHorizontalOutline } from "react-icons/io5";
import { useCart } from "react-use-cart";

//internal import

import Price from "@components/common/Price";
import Stock from "@components/common/Stock";
import { notifyError } from "@utils/toast";
import useAddToCart from "@hooks/useAddToCart";
import useGetSetting from "@hooks/useGetSetting";
import Discount from "@components/common/Discount";
import useUtilsFunction from "@hooks/useUtilsFunction";
import ProductModal from "@components/modal/ProductModal";
import ImageWithFallback from "@components/common/ImageWithFallBack";
import { handleLogEvent } from "src/lib/analytics";

const DELIVERY_MODE_LABELS = {
  onsite: { label: "Sur site", Icon: IoLocationOutline },
  online: { label: "En ligne", Icon: IoDesktopOutline },
  hybrid: { label: "Hybride", Icon: IoSwapHorizontalOutline },
};

const DURATION_UNIT_SHORT = { minutes: "min", hours: "h", days: "j" };

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
  const modeInfo = sd?.deliveryMode ? DELIVERY_MODE_LABELS[sd.deliveryMode] : null;

  const handleAddItem = (p) => {
    if (p.stock < 1) return notifyError("Stock insuffisant !");
    if (p?.variants?.length > 0) {
      setModalOpen(!modalOpen);
      return;
    }
    const { slug, variants, categories, description, ...updatedProduct } = product;
    const newItem = {
      ...updatedProduct,
      title: showingTranslateValue(p?.title),
      id: p._id,
      variant: p.prices,
      price: p.prices.price,
      originalPrice: product.prices?.originalPrice,
    };
    addItem(newItem);
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

      <div className={`group box-border overflow-hidden flex rounded-md shadow-sm flex-col items-center bg-white relative ${isService ? "ring-1 ring-indigo-100" : ""} ${isOutOfStock ? "opacity-60 grayscale" : ""}`}>

        {/* Header badges row */}
        <div className="w-full flex justify-between items-start px-2 pt-2">
          <div className="flex items-center gap-1">
            {!isService && <Stock product={product} stock={product.stock} card />}
          </div>
          {isService ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 uppercase tracking-wide">
              <IoPersonOutline size={10} /> Service
            </span>
          ) : (
            <Discount product={product} />
          )}
        </div>

        {/* Image */}
        <div
          onClick={() => {
            if (!isService) {
              setModalOpen(!modalOpen);
              handleLogEvent("product", `opened ${showingTranslateValue(product?.title)} product modal`);
            }
          }}
          className={`relative flex justify-center pt-1 w-full h-44 ${!isService ? "cursor-pointer" : ""}`}
        >
          <div className="relative w-full h-full p-2">
            {product?.image && product.image.length > 0 && product.image[0] ? (
              <ImageWithFallback src={product.image[0]} alt="product" />
            ) : (
              <Image
                src="https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
                fill
                style={{ objectFit: "contain" }}
                sizes="100%"
                alt="product"
                className="object-contain transition duration-150 ease-linear transform group-hover:scale-105"
              />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="w-full px-3 lg:px-4 pb-4 overflow-hidden">
          <div className="relative mb-1">
            <span className="text-gray-400 font-medium text-xs d-block mb-1">
              {product.unit}
            </span>
            <h2 className="text-heading mb-0 block text-sm font-medium text-gray-600">
              <span className="line-clamp-2">
                {showingTranslateValue(product?.title)}
              </span>
            </h2>
          </div>

          {/* Service details chips */}
          {isService && (sd?.deliveryMode || sd?.durationValue) && (
            <div className="flex flex-wrap gap-1 mb-2">
              {modeInfo && (
                <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-medium">
                  <modeInfo.Icon size={9} />
                  {modeInfo.label}
                </span>
              )}
              {sd?.durationValue && (
                <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
                  <IoTimeOutline size={9} />
                  {sd.durationValue}&nbsp;{DURATION_UNIT_SHORT[sd.durationUnit] || sd.durationUnit}
                </span>
              )}
            </div>
          )}

          <div className="flex justify-between items-center text-heading text-sm sm:text-base space-s-2 md:text-base lg:text-xl">
            <Price
              card
              product={product}
              currency={currency}
              price={product?.isCombination ? product?.variants[0]?.price : product?.prices?.price}
              originalPrice={product?.isCombination ? product?.variants[0]?.originalPrice : product?.prices?.originalPrice}
            />

            {/* CTA */}
            {isService ? (
              <Link
                href={`/product/${product.slug}`}
                className="h-9 px-3 flex items-center justify-center border border-indigo-200 rounded text-indigo-500 hover:border-indigo-500 hover:bg-indigo-500 hover:text-white transition-all text-xs font-semibold font-serif whitespace-nowrap"
              >
                Voir
              </Link>
            ) : isOutOfStock ? (
              <span className="h-9 px-2 flex items-center justify-center text-[10px] font-bold text-red-400 border border-red-100 rounded bg-red-50 whitespace-nowrap">
                Indisponible
              </span>
            ) : inCart(product._id) ? (
              <div>
                {items.map(
                  (item) =>
                    item.id === product._id && (
                      <div
                        key={item.id}
                        className="h-9 w-auto flex flex-wrap items-center justify-evenly py-1 px-2 bg-emerald-500 text-white rounded"
                      >
                        <button onClick={() => updateItemQuantity(item.id, item.quantity - 1)}>
                          <span className="text-dark text-base"><IoRemove /></span>
                        </button>
                        <p className="text-sm text-dark px-1 font-serif font-semibold">{item.quantity}</p>
                        <button onClick={() => item?.variants?.length > 0 ? handleAddItem(item) : handleIncreaseQuantity(item)}>
                          <span className="text-dark text-base"><IoAdd /></span>
                        </button>
                      </div>
                    )
                )}
              </div>
            ) : (
              <button
                onClick={() => handleAddItem(product)}
                aria-label="cart"
                className="h-9 w-9 flex items-center justify-center border border-gray-200 rounded text-emerald-500 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
              >
                <span className="text-xl"><IoBagAddSharp /></span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(ProductCard), { ssr: false });
