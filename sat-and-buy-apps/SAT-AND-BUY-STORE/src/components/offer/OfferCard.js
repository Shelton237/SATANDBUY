import React from "react";
import dayjs from "dayjs";

//internal import
import Coupon from "@components/coupon/Coupon";
import useAsync from "@hooks/useAsync";
import CouponServices from "@services/CouponServices";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";

const OfferCard = () => {
  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const { data } = useAsync(CouponServices.getShowingCoupons);

  // Only render if there's at least one active (non-expired) coupon
  const hasActive = (data || []).some((c) => !dayjs().isAfter(dayjs(c.endTime)));
  if (!hasActive) return null;

  return (
    <div className="w-full group">
      <div className="bg-gray-50 h-full border-2 border-orange-500 transition duration-150 ease-linear transform group-hover:border-emerald-500 rounded shadow">
        <div className="bg-orange-100 text-gray-900 px-6 py-2 rounded-t border-b flex items-center justify-center">
          <h3 className="text-base font-serif font-medium">
            {showingTranslateValue(
              storeCustomizationSetting?.home?.discount_title
            )}
          </h3>
        </div>
        <div className="overflow-hidden">
          <Coupon couponInHome />
        </div>
      </div>
    </div>
  );
};

export default OfferCard;
