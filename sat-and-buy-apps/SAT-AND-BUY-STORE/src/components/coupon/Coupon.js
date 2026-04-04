import React, { useState } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import { CopyToClipboard } from "react-copy-to-clipboard";

//internal import
import useAsync from "@hooks/useAsync";
import CouponServices from "@services/CouponServices";
import OfferTimer from "@components/coupon/OfferTimer";
import useUtilsFunction from "@hooks/useUtilsFunction";

const DiscountLabel = ({ coupon, currency }) => {
  const { type, value } = coupon?.discountType || {};
  if (type === "fixed" || type === "flat") {
    return <span>{value} {currency}</span>;
  }
  return <span>{value}%</span>;
};

const Coupon = ({ couponInHome }) => {
  const [copiedCode, setCopiedCode] = useState("");
  const [copied, setCopied] = useState(false);

  const { data, error } = useAsync(CouponServices.getShowingCoupons);
  const { showingTranslateValue, currency, getNumberTwo } = useUtilsFunction();

  const handleCopied = (code) => {
    setCopiedCode(code);
    setCopied(true);
  };

  // Only show coupons that are currently active (not expired)
  const activeCoupons = (data || []).filter(
    (c) => !dayjs().isAfter(dayjs(c.endTime))
  );

  if (error) {
    return (
      <p className="flex justify-center items-center m-auto text-xl text-red-500">
        {error}
      </p>
    );
  }

  // Nothing to show
  if (!activeCoupons.length) return null;

  const couponsToShow = couponInHome ? activeCoupons.slice(0, 2) : activeCoupons;

  return (
    <>
      {couponsToShow.map((coupon) => (
        <div
          key={coupon._id}
          className={
            couponInHome
              ? "coupon coupon-home mx-4 my-5 block md:flex lg:flex md:justify-between lg:justify-between items-center bg-white rounded-md shadow"
              : "coupon block md:flex lg:flex md:justify-between lg:justify-between items-center bg-white rounded-md shadow-sm"
          }
        >
          <div className={`tengah flex items-center justify-items-start ${couponInHome ? "py-2 px-3" : "p-6"}`}>
            {coupon.logo && (
              <figure>
                <Image
                  src={coupon.logo}
                  width={couponInHome ? 100 : 120}
                  height={couponInHome ? 100 : 120}
                  className="rounded-lg"
                  alt={showingTranslateValue(coupon.title)}
                />
              </figure>
            )}
            <div className={couponInHome ? "ml-3" : "ml-5"}>
              {/* Timer */}
              <span className="inline-block mb-2">
                <div className="flex items-center font-semibold">
                  <OfferTimer
                    expiryTimestamp={new Date(coupon.endTime)}
                    darkGreen={couponInHome}
                  />
                </div>
              </span>

              {/* Title */}
              <h2 className={`pl-1 font-serif ${couponInHome ? "text-base text-gray-700 leading-6 font-semibold mb-2" : "text-lg leading-6 font-medium mb-3"}`}>
                {showingTranslateValue(coupon?.title)}
              </h2>

              {/* Discount amount */}
              <div className={`flex items-center font-serif ${couponInHome ? "" : "mb-1"}`}>
                <h6 className="pl-1 text-base font-medium text-gray-600">
                  <span className="text-lg md:text-xl text-red-500 font-bold">
                    <DiscountLabel coupon={coupon} currency={currency} />
                  </span>{" "}
                  de remise
                </h6>
                {/* Active badge — home only */}
                {couponInHome && (
                  <span className="ml-2 text-emerald-600 inline-block px-4 py-1 rounded-full font-medium text-xs bg-emerald-100">
                    Actif
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Code copy panel */}
          <div className={`md:border-l-2 lg:border-l-2 border-dashed lg:w-1/3 md:w-1/3 relative ${couponInHome ? "px-4" : "px-6"}`}>
            <div className={`info flex items-center ${couponInHome ? "" : "lg:my-6 md:my-5 mb-6"}`}>
              <div className="w-full">
                {!couponInHome && (
                  <div className="font-serif font-medium flex items-center mb-1">
                    <span>Code promo</span>
                    <span className="ml-2 text-emerald-600 inline-block text-sm font-semibold">
                      Actif
                    </span>
                  </div>
                )}
                <div className="font-serif border border-dashed bg-emerald-50 py-1 border-emerald-300 rounded-lg text-center block">
                  <CopyToClipboard
                    text={coupon.couponCode}
                    onCopy={() => handleCopied(coupon.couponCode)}
                  >
                    <button className="block w-full">
                      {copied && coupon.couponCode === copiedCode ? (
                        <span className="text-emerald-600 text-sm leading-7 font-semibold">
                          Copié !
                        </span>
                      ) : (
                        <span className="uppercase font-serif font-semibold text-sm leading-7 text-emerald-600">
                          {coupon.couponCode}
                        </span>
                      )}
                    </button>
                  </CopyToClipboard>
                </div>
                <p className="text-xs leading-4 text-gray-500 mt-2">
                  * Valable pour tout achat supérieur à{" "}
                  <span className="font-bold">
                    {getNumberTwo(coupon.minimumAmount)} {currency}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default Coupon;
