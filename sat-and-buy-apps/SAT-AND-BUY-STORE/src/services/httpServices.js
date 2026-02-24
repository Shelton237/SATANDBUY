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

const apiInstance = createInstance(process.env.NEXT_PUBLIC_API_BASE_URL);
const authBase =
  process.env.NEXT_PUBLIC_AUTH_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL;
const authInstance = createInstance(authBase);
const catalogBase =
  process.env.NEXT_PUBLIC_CATALOG_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL;
const catalogInstance = createInstance(catalogBase);
const orderBase =
  process.env.NEXT_PUBLIC_ORDER_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL;
const orderInstance = createInstance(orderBase);

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
