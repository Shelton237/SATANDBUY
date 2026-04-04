import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IoBagAddSharp, IoEyeOutline, IoHeartOutline } from "react-icons/io5";
import { useCart } from "react-use-cart";
import { notifyError } from "@utils/toast";
import useAddToCart from "@hooks/useAddToCart";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import Price from "@components/common/Price";
import Discount from "@components/common/Discount";
import ProductModal from "@components/modal/ProductModal";
import ImageWithFallback from "@components/common/ImageWithFallBack";

const CollectionProductCard = ({ product, attributes, loading = false }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { addItem, inCart } = useCart();
  const { globalSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const currency = globalSetting?.default_currency || "FCFA";
  const isOutOfStock = product.stock <= 0;

  const handleAddItem = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    if (product?.variants?.length > 0) {
      setModalOpen(true);
      return;
    }
    const { slug, variants, categories, description, ...updatedProduct } = product;
    const newItem = {
      ...updatedProduct,
      title: showingTranslateValue(product?.title),
      id: product._id,
      variant: product.prices,
      price: product.prices.price,
      originalPrice: product.prices?.originalPrice,
    };
    addItem(newItem);
  };

  return (
    <>
      {modalOpen && (
        <ProductModal
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          product={product}
          currency={currency}
          attributes={attributes}
        />
      )}

      <div className={`group relative bg-white flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg border border-transparent hover:border-gray-100 p-2 rounded-lg ${isOutOfStock ? "opacity-60 grayscale" : ""}`}>
        {/* Image Container */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-50 rounded-md">
          <Link href={`/product/${product.slug}`} className="block w-full h-full">
            <div className="relative w-full h-full p-2">
              <ImageWithFallback src={product.image[0]} alt={showingTranslateValue(product?.title)} />
              
              {/* Overlay with Quick Actions on Hover */}
              {!isOutOfStock && (
                <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={handleAddItem}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-emerald-600 shadow-md hover:bg-emerald-600 hover:text-white transition-all transform hover:scale-110 active:scale-95"
                      title="Quick Add"
                    >
                      <IoBagAddSharp size={18} />
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); setModalOpen(true); }}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-md hover:bg-gray-100 transition-all transform hover:scale-110 active:scale-95 border border-gray-100"
                      title="Quick View"
                    >
                      <IoEyeOutline size={18} />
                    </button>
                  </div>
                </div>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-red-50 border border-red-200 text-red-500 text-xs font-bold px-3 py-1 rounded-full">
                    Indisponible
                  </span>
                </div>
              )}
            </div>
          </Link>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col space-y-1">
            <Discount product={product} />
          </div>
          
          <div className="absolute top-2 right-2">
            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-white/80 backdrop-blur-sm rounded-full">
              <IoHeartOutline size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-3 text-center px-1">
          <div className="mb-1">
             <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600">
               {product.unit || "JEWELRY"}
             </span>
          </div>
          <Link href={`/product/${product.slug}`}>
            <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 hover:text-emerald-600 transition-colors uppercase tracking-tight">
              {showingTranslateValue(product?.title)}
            </h3>
          </Link>
          
          <div className="mt-2 flex items-center justify-center font-serif">
            <Price
              card
              product={product}
              currency={currency}
              price={product?.isCombination ? product?.variants[0]?.price : product?.prices?.price}
              originalPrice={product?.isCombination ? product?.variants[0]?.originalPrice : product?.prices?.originalPrice}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CollectionProductCard;
