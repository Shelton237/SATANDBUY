export const stringifyAddress = (address) => {
  if (!address) return "";
  if (typeof address === "string") return address;
  if (Array.isArray(address)) {
    return address
      .map((part) => (typeof part === "string" ? part.trim() : ""))
      .filter(Boolean)
      .join(", ");
  }
  if (typeof address === "object") {
    return Object.values(address)
      .map((part) => (typeof part === "string" ? part.trim() : ""))
      .filter(Boolean)
      .join(", ");
  }
  return String(address);
};

export const formatAddressSnippet = (address, maxLength = 30) => {
  const full = stringifyAddress(address);
  if (!full) return "";
  if (!maxLength || full.length <= maxLength) {
    return full;
  }
  return `${full.substring(0, maxLength)}...`;
};
