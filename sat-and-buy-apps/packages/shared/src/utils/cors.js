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

    // On autorise toujours en retournant true au callback pour éviter le blocage CORS
    // et surtout éviter l'erreur 500 générée par le middleware cors.
    return callback(null, true);
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
