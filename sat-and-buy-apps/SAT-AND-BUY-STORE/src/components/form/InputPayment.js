import React from "react";

const InputPayment = ({
  register,
  Icon,
  name,
  value,
  setShowCard,
  disabled = false,
  watch,
}) => {
  const handleSelect = () => {
    if (disabled) return;
    setShowCard(value === "Card");
  };

  const isChecked = watch && watch("paymentMethod") === value;

  return (
    <div
      className={`px-3 py-4 card border rounded-md transition-all ${
        isChecked ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-white"
      } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <label className="cursor-pointer label block w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className={`text-xl mr-3 ${isChecked ? "text-emerald-500" : "text-gray-400"}`}>
              <Icon />
            </span>
            <h6 className={`font-serif font-medium text-sm ${isChecked ? "text-emerald-600" : "text-gray-600"}`}>
              {name}
            </h6>
          </div>
          <input
            {...register("paymentMethod", {
              required: "Payment Method is required!",
            })}
            onClick={handleSelect}
            type="radio"
            value={value}
            className="form-radio outline-none focus:ring-0 text-emerald-500"
            disabled={disabled}
          />
        </div>
      </label>
    </div>
  );
};

export default InputPayment;
