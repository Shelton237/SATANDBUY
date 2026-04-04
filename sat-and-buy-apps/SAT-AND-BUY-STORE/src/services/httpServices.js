import axios from "axios";

const createInstance = (baseURL) =>
  axios.create({
    baseURL,
    timeout: 50000,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

const transformUrl = (url) => {
  if (!url) return url;
  
  const useDocker = process.env.USE_DOCKER_NETWORK === "true";
  const isServer = typeof window === "undefined";

  if (useDocker && isServer) {
    console.log("[SSR] Transforming URL before:", url);
    const newUrl = url
      .replace(/^https:\/\//, "http://")
      .replace(/localhost:5055/g, "api-gateway:5055")
      .replace(/127\.0\.0\.1:5055/g, "api-gateway:5055")
      .replace(/gateway\.diginova\.cm\/api/g, "api-gateway:5055/api")
      .replace(/localhost:5100/g, "catalog-service:5100")
      .replace(/127\.0\.0\.1:5100/g, "catalog-service:5100")
      .replace(/localhost:6001/g, "auth-service:6001")
      .replace(/127\.0\.0\.1:6001/g, "auth-service:6001")
      .replace(/localhost:5200/g, "order-service:5200")
      .replace(/127\.0\.0\.1:5200/g, "order-service:5200");
    console.log("[SSR] Transformed URL after:", newUrl);
    return newUrl;
  }
  return url;
};

const apiInstance = createInstance(
  transformUrl(process.env.NEXT_PUBLIC_API_BASE_URL)
);
const authBase =
  process.env.NEXT_PUBLIC_AUTH_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
const authInstance = createInstance(transformUrl(authBase));
const catalogBase =
  process.env.NEXT_PUBLIC_CATALOG_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL;
const catalogInstance = createInstance(transformUrl(catalogBase));
const orderBase =
  process.env.NEXT_PUBLIC_ORDER_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
const orderInstance = createInstance(transformUrl(orderBase));

export const setToken = (token) => {
  const instances = [apiInstance, authInstance, catalogInstance, orderInstance];
  instances.forEach((client) => {
    if (token) {
      client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete client.defaults.headers.common["Authorization"];
    }
  });
};

const responseBody = (response) => response.data;

const buildRequests = (instance) => ({
  get: (url, body) => instance.get(url, body).then(responseBody),
  post: (url, body, headers) =>
    instance.post(url, body, headers).then(responseBody),
  // Pour les uploads multipart : supprime Content-Type afin que le navigateur
  // injecte automatiquement "multipart/form-data; boundary=..."
  postForm: (url, formData) =>
    instance
      .post(url, formData, { headers: { "Content-Type": undefined } })
      .then(responseBody),
  put: (url, body) => instance.put(url, body).then(responseBody),
  delete: (url) => instance.delete(url).then(responseBody),
});

const requests = buildRequests(apiInstance);
export const authRequests = buildRequests(authInstance);
export const catalogRequests = buildRequests(catalogInstance);
export const orderRequests = buildRequests(orderInstance);

export default requests;
