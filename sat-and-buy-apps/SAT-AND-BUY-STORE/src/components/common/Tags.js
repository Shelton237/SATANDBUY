import React, { useMemo } from "react";

const normalizeTags = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((item) => !!item && item.toString().trim() !== "");
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item) => !!item && item.toString().trim() !== ""
        );
      }
    } catch (err) {
      // ignore parse error and fallback to comma splitting
    }
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");
  }
  return [];
};

const Tags = ({ product = {} }) => {
  const tags = useMemo(() => normalizeTags(product?.tag), [product?.tag]);

  if (!tags.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t, i) => (
        <span
          key={`${t}-${i}`}
          className="bg-gray-50 mr-2 border-0 text-gray-600 rounded-full inline-flex items-center justify-center px-3 py-1 text-xs font-semibold font-serif mt-2"
        >
          {t}
        </span>
      ))}
    </div>
  );
};

export default Tags;
