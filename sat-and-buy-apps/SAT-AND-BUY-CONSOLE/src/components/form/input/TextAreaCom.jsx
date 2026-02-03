import { Textarea } from "@windmill/react-ui";
import React from "react";

const TextAreaCom = ({
  register,
  name,
  label,
  placeholder,
  required = false,
  value,
  onChange,
  type,
}) => {
  const isControlled = typeof value !== "undefined" && typeof onChange === "function";

  return (
    <Textarea
      className="border text-sm border-gray-200 focus:border-gray-300 block w-full bg-gray-100"
      name={name}
      type={type}
      placeholder={placeholder}
      rows="4"
      spellCheck="false"
      value={isControlled ? value : undefined}
      onChange={isControlled ? onChange : undefined}
      defaultValue={!isControlled ? undefined : undefined} // rien à injecter ici
      {...(!isControlled && typeof register === "function"
        ? register(name, {
            required: required ? `${label} is required!` : false,
          })
        : {})}
    />
  );
};

export default TextAreaCom;
