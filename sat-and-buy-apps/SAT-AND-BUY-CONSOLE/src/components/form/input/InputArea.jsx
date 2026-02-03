import React from "react";
import { Input } from "@windmill/react-ui";

const InputArea = ({
  register,
  defaultValue,
  required = false,
  name,
  label,
  type = "text",
  autoComplete,
  placeholder,
  value,
  onChange,
}) => {
  const isControlled = typeof value !== "undefined" && typeof onChange === "function";

  return (
    <Input
      name={name}
      type={type}
      placeholder={placeholder}
      autoComplete={autoComplete}
      defaultValue={!isControlled ? defaultValue : undefined}
      value={isControlled ? value : undefined}
      onChange={isControlled ? onChange : undefined}
      className="mr-2 h-12 p-2"
      {...(!isControlled && typeof register === "function"
        ? register(name, {
            required: required ? `${label} is required!` : false,
          })
        : {})}
    />
  );
};

export default InputArea;