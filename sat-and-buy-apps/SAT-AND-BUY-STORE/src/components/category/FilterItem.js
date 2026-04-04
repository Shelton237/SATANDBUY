import React, { useState } from "react";
import { IoChevronDownOutline, IoChevronForwardOutline } from "react-icons/io5";
import useUtilsFunction from "@hooks/useUtilsFunction";

const FilterItem = ({ title, options, activeOptions, onToggle }) => {
  const [isOpen, setIsOpen] = useState(true);
  const { showingTranslateValue } = useUtilsFunction();

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left focus:outline-none"
      >
        <span className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
          {title}
        </span>
        <span className="text-gray-400">
          {isOpen ? <IoChevronDownOutline /> : <IoChevronForwardOutline />}
        </span>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {options?.map((option) => (
            <label
              key={option.id || option._id}
              className="group flex items-center cursor-pointer"
            >
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={activeOptions?.includes(idString(option))}
                  onChange={() => onToggle(idString(option))}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </div>
              <span className="ml-3 text-sm text-gray-600 group-hover:text-emerald-600 transition-colors">
                {showingTranslateValue(option.name) || showingTranslateValue(option.title) || option.name || option.title}
                {option.count !== undefined && (
                  <span className="ml-1 text-gray-400">({option.count})</span>
                )}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper to get string ID
const idString = (opt) => String(opt.id || opt._id);

export default FilterItem;
