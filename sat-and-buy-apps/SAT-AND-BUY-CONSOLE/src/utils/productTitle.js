export const resolveProductTitle = (title, fallback = "") => {
  if (!title) return fallback;
  if (typeof title === "string") return title;
  if (typeof title === "object") {
    const candidate =
      title?.en ||
      title?.fr ||
      Object.values(title).find((val) => typeof val === "string");
    if (candidate) return candidate;
  }
  return String(title);
};

export const formatProductTitle = (title, maxLength = 20, fallback = "") => {
  const resolved = resolveProductTitle(title, fallback);
  if (!resolved) return fallback;
  if (!maxLength || resolved.length <= maxLength) {
    return resolved;
  }
  return `${resolved.substring(0, maxLength)}...`;
};
