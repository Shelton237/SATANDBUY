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
  if (process.env.USE_DOCKER_NETWORK === "true" && typeof window === "undefined") {
    return url
      .replace("localhost:5055", "api-gateway:5055")
      .replace("127.0.0.1:5055", "api-gateway:5055")
      .replace("localhost:5100", "catalog-service:5100")
      .replace("127.0.0.1:5100", "catalog-service:5100")
      .replace("localhost:6001", "auth-service:6001")
      .replace("127.0.0.1:6001", "auth-service:6001")
      .replace("localhost:5200", "order-service:5200")
      .replace("127.0.0.1:5200", "order-service:5200");
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
  put: (url, body) => instance.put(url, body).then(responseBody),
});

const requests = buildRequests(apiInstance);
export const authRequests = buildRequests(authInstance);
export const catalogRequests = buildRequests(catalogInstance);
export const orderRequests = buildRequests(orderInstance);

export default requests;
