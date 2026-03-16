import useUtilsFunction from "@/hooks/useUtilsFunction";

const Price = ({ product, price, currency }) => {
  const { getNumberTwo, currency: globalCurrency } = useUtilsFunction();
  const currentCurrency = currency || globalCurrency || "FCFA";
  const amount = price || product?.prices?.originalPriceWithTax || 0;

  return (
    <div className="font-serif product-price font-bold dark:text-gray-400">
      {getNumberTwo(amount)} {currentCurrency}
    </div>
  );
};

export default Price;
