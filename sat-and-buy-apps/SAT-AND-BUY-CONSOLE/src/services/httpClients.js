import HttpService from "@/services/httpService";

const defaultHeaders = {
  "Content-Type": "application/json",
};

const VITE_ENV = {
  VITE_APP_API_BASE_URL: import.meta.env.VITE_APP_API_BASE_URL,
  VITE_APP_AUTH_BASE_URL: import.meta.env.VITE_APP_AUTH_BASE_URL,
  VITE_APP_CATALOG_BASE_URL: import.meta.env.VITE_APP_CATALOG_BASE_URL,
  VITE_APP_ORDER_BASE_URL: import.meta.env.VITE_APP_ORDER_BASE_URL,
};

const resolveBaseUrl = (value, fallbackPort, pathSuffix = "/") => {
  if (value && value.trim()) {
    return value;
  }

  if (typeof window === "undefined") {
    return pathSuffix;
  }

  const { protocol, hostname } = window.location;
  const portSegment = fallbackPort ? `:${fallbackPort}` : "";

  return `${protocol}//${hostname}${portSegment}${pathSuffix}`;
};

const API_BASE_URL = resolveBaseUrl(
  VITE_ENV.VITE_APP_API_BASE_URL,
  5055,
  "/api"
);
const AUTH_BASE_URL = resolveBaseUrl(
  VITE_ENV.VITE_APP_AUTH_BASE_URL,
  5055,
  "/api/auth"
);
const CATALOG_BASE_URL = resolveBaseUrl(
  VITE_ENV.VITE_APP_CATALOG_BASE_URL,
  5055,
  "/api/catalog"
);
const ORDER_BASE_URL = resolveBaseUrl(
  VITE_ENV.VITE_APP_ORDER_BASE_URL,
  5055,
  "/api"
);

const logEnvDiagnostics = () => {
  const missingVars = Object.entries(VITE_ENV)
    .filter(([, value]) => !value || !value.trim())
    .map(([key]) => key);

  if (missingVars.length) {
    console.warn(
      `[httpClients] Variables Vite manquantes: ${missingVars.join(
        ", "
      )}. Utilisation de valeurs par défaut basées sur la fenêtre courante.`
    );
  }

  if (import.meta.env.DEV) {
    console.info("[httpClients] URLs configurées:", {
      API_BASE_URL,
      AUTH_BASE_URL,
      CATALOG_BASE_URL,
      ORDER_BASE_URL,
    });
  }
};

logEnvDiagnostics();

export const apiHttp = new HttpService(API_BASE_URL, defaultHeaders);
export const authHttp = new HttpService(AUTH_BASE_URL, defaultHeaders);
export const catalogHttp = new HttpService(CATALOG_BASE_URL, defaultHeaders);
export const orderHttp = new HttpService(ORDER_BASE_URL, defaultHeaders);
