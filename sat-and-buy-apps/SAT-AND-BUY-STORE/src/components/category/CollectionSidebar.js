import React from "react";
import FilterItem from "./FilterItem";
import useTranslation from "next-translate/useTranslation";
import useUtilsFunction from "@hooks/useUtilsFunction";

const CollectionSidebar = ({
  categories,
  attributes,
  selectedFilters,
  onFilterToggle,
  priceRange,
  onPriceChange,
  isMobile = false,
}) => {
  const { t } = useTranslation();
  const { showingTranslateValue } = useUtilsFunction();

  return (
    <div className={`collection-sidebar ${isMobile ? "p-4" : "sticky top-10"}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">{t("common:filters")}</h3>
        <button
          onClick={() => onFilterToggle("reset")}
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 underline focus:outline-none"
        >
          {t("common:clearAll")}
        </button>
      </div>

      {/* Hierarchical Categories Filter */}
      {categories?.length > 0 && (
        <FilterItem
          title={t("common:categories")}
          options={categories}
          activeOptions={selectedFilters.categories}
          onToggle={(id) => onFilterToggle("category", id)}
        />
      )}

      {/* Dynamic Attributes Filters */}
      {attributes?.map((attr) => (
        <FilterItem
          key={attr._id}
          title={showingTranslateValue(attr.title) || "Attribute"}
          options={attr?.variants || []}
          activeOptions={selectedFilters.attributes}
          onToggle={(id) => onFilterToggle("attribute", id)}
        />
      ))}

      {/* Price Range Filter (Conceptual) */}
      <div className="border-b border-gray-200 py-6">
        <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">
          {t("common:price-range")}
        </h4>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => onPriceChange("min", e.target.value)}
            className="w-full rounded border-gray-300 py-2 px-3 text-sm focus:ring-emerald-500 focus:border-emerald-500"
          />
          <span className="text-gray-400">—</span>
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => onPriceChange("max", e.target.value)}
            className="w-full rounded border-gray-300 py-2 px-3 text-sm focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};

export default CollectionSidebar;
