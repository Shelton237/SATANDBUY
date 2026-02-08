import React from "react";

const InputPayment = ({
  register,
  Icon,
  name,
  value,
  setShowCard,
  disabled = false,
}) => {
  const handleSelect = () => {
    if (disabled) return;
    setShowCard(value === "Card");
  };

  return (
    <div
      className={`px-3 py-4 card border border-gray-200 bg-white rounded-md ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      <label className="cursor-pointer label">
        <div className="flex item-center justify-between">
          <div className="flex items-center">
            <span className="text-xl mr-3 text-gray-400">
              <Icon />
            </span>
            <h6 className="font-serif font-medium text-sm text-gray-600">
              {name}
            </h6>
          </div>
          <input
            onClick={handleSelect}
            {...register("paymentMethod", {
              required: "Payment Method is required!",
            })}
            type="radio"
            value={value}
            name="paymentMethod"
            className="form-radio outline-none focus:ring-0 text-emerald-500"
            disabled={disabled}
          />
        </div>
      </label>
    </div>
  );
};

export default InputPayment;
