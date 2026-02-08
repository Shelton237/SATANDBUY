import { Select } from "@windmill/react-ui";
import React from "react";

const ISO_CODES = ["en", "fr"];

const SelectISOCode = ({ name, register, required, label }) => {
  return (
    <Select
      name={name}
      {...register(`${name}`, {
        required: required ? `${label} is required!` : false,
      })}
    >
      <option value="" defaultValue hidden>
        Default Iso Code
      </option>
      {ISO_CODES.map((value, index) => (
        <option key={`${value}-${index}`} value={value}>
          {value}
        </option>
      ))}
    </Select>
  );
};

export default SelectISOCode;
