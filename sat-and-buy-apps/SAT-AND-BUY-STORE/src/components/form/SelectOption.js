import React from "react";
import Label from "@components/form/Label";

const SelectOption = ({
  name,
  label,
  options = [],
  register,
  required = true,
}) => {
  return (
    <>
      <Label label={label} />
      <div className="relative">
        <select
          {...register(`${name}`, {
            required: required ? `${label} est requis !` : false,
          })}
          className="py-2 px-4 md:px-5 w-full appearance-none border text-sm opacity-75 text-input rounded-md placeholder-body min-h-12 transition duration-200 focus:ring-0 ease-in-out bg-white border-gray-200 focus:outline-none focus:border-emerald-500 h-11 md:h-12"
        >
          <option value="">
            {label ? `Sélectionnez ${label}` : "-- Sélectionner --"}
          </option>
          {options.map((option, index) => (
            <option key={option + index} value={option}>
              {option}
            </option>
          ))}
        </select>
        {/* Simple chevron icon for select */}
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    </>
  );
};

export default SelectOption;
