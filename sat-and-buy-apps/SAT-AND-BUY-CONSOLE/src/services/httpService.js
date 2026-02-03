// services/HttpService.js
import axios from "axios";

class HttpService {
  constructor(baseURL, defaultHeaders = {}) {
    this.client = axios.create({
      baseURL,
      headers: defaultHeaders
    });
  }

  setHeaders(headers) {
    Object.assign(this.client.defaults.headers, headers);
  }

  async request(method, url, data = null, token = null, headers = {}) {
    try {
      const config = {
        method,
        url,
        headers: {
          ...headers,
          ...(token && { Authorization: `Bearer ${token}` })
        },
        ...(data && { data })
      };

      const response = await this.client.request(config);
      return response;
    } catch (error) {
      const msg = error.response?.data?.error_description || error.message;
      console.error(`[HttpService] ${method.toUpperCase()} ${url}: ${msg}`);
      throw new Error(msg);
    }
  }

  get(url, token, headers = {}) {
    return this.request("get", url, null, token, headers);
  }

  post(url, data, token, headers = {}) {
    return this.request("post", url, data, token, headers);
  }

  put(url, data, token, headers = {}) {
    return this.request("put", url, data, token, headers);
  }

  delete(url, token, headers = {}) {
    return this.request("delete", url, null, token, headers);
  }
}

export default HttpService;