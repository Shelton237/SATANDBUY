"use strict";

const parseCorsOrigins = (value) => {
  if (!value || value === "*") return "*";
  if (Array.isArray(value)) {
    return value.map((origin) => origin && origin.trim()).filter(Boolean);
  }

  return String(value)
    .split(",")
    .map((origin) => origin.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
};

const buildCorsOriginOption = (origins) => {
  const allowedOrigins = parseCorsOrigins(origins);
  if (allowedOrigins === "*") {
    return "*";
  }

  const allowed = new Set(allowedOrigins);
  return (origin, callback) => {
    // En développement, on autorise localhost par défaut
    const isDev = process.env.NODE_ENV === "development";
    const isLocalhost =
      origin &&
      (origin.startsWith("http://localhost") ||
        origin.startsWith("http://127.0.0.1"));

    if (!origin || allowed.has(origin) || (isDev && isLocalhost)) {
      return callback(null, true);
    }

    return callback(
      new Error(
        `Origin ${origin} is not allowed. Allowed origins: ${[
          ...allowed,
        ].join(", ")}`
      )
    );
  };
};

const createCorsOptions = (origins, extraOptions = {}) => ({
  origin: buildCorsOriginOption(origins),
  ...extraOptions,
});

module.exports = {
  parseCorsOrigins,
  buildCorsOriginOption,
  createCorsOptions,
};
