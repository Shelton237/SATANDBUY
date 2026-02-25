import React from "react";
import { TableCell, TableBody, TableRow } from "@windmill/react-ui";
import { resolveProductTitle } from "@/utils/productTitle";

const resolvePrice = (item) => {
  if (typeof item?.price === "number") return item.price;
  if (typeof item?.prices?.price === "number") return item.prices.price;
  if (typeof item?.prices?.originalPrice === "number")
    return item.prices.originalPrice;
  return 0;
};

const resolveLineTotal = (item) => {
  if (typeof item?.itemTotal === "number") return item.itemTotal;
  const qty = typeof item?.quantity === "number" ? item.quantity : 0;
  return resolvePrice(item) * qty;
};

const Invoice = ({ data, currency, getNumberTwo }) => {
  return (
    <>
      <TableBody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 text-serif text-sm ">
        {data?.cart?.map((item, i) => {
          const title = resolveProductTitle(item.title);
          const isLong = title.length > 15;
          return (
            <TableRow
              key={i}
              className="dark:border-gray-700 dark:text-gray-400"
            >
              <TableCell className="px-6 py-1 whitespace-nowrap font-normal text-gray-500 text-left">
                {i + 1}{" "}
              </TableCell>
              <TableCell className="px-6 py-1 whitespace-nowrap font-normal text-gray-500">
                <span
                  className={`text-gray-700 font-semibold  dark:text-gray-300 text-xs ${
                    isLong ? "wrap-long-title" : ""
                  }`}
                >
                  {title}
                </span>
              </TableCell>
              <TableCell className="px-6 py-1 whitespace-nowrap font-bold text-center">
                {item.quantity}{" "}
              </TableCell>
              <TableCell className="px-6 py-1 whitespace-nowrap font-bold text-center">
                {currency}
                {getNumberTwo(resolvePrice(item))}
              </TableCell>

              <TableCell className="px-6 py-1 whitespace-nowrap text-right font-bold text-red-500 dark:text-emerald-500">
                {currency}
                {getNumberTwo(resolveLineTotal(item))}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </>
  );
};

export default Invoice;
