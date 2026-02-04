import HttpService from "@/services/httpService";
import store from "@/reduxStore/store";

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;
const TOKEN_TTL_SECONDS = 24 * 60 * 60; // Backend JWT expires in 1 day

const http = new HttpService(API_BASE_URL, {
  "Content-Type": "application/json"
});

const mapAdminPayload = (data = {}) => {
  const name =
    typeof data.name === "object"
      ? data.name?.en || Object.values(data.name)[0]
      : data.name || "Admin";

  return {
    id: data._id,
    name,
    email: data.email,
    phone: data.phone,
    image: data.image,
    role: data.role || "Admin"
  };
};

class AuthService {
  static async login(email, password) {
    const { data } = await http.post("/admin/login", { email, password });
    const user = mapAdminPayload(data);
    const authData = {
      user,
      token: data.token,
      refreshToken: null,
      expiresIn: TOKEN_TTL_SECONDS,
      timestamp: Date.now()
    };

    this.#persistAuth(authData);
    return authData;
  }

  static async refreshToken() {
    const authData = this.getAuthData();
    if (!authData) {
      throw new Error("No session available");
    }

    const isExpired =
      authData.timestamp + authData.expiresIn * 1000 <= Date.now();

    if (isExpired) {
      this.clearAuth();
      throw new Error("Session expired");
    }

    return authData;
  }

  static syncReduxWithLocalStorage() {
    const authData = this.getAuthData();
    if (authData) {
      store.dispatch({
        type: "auth/loginSuccess",
        payload: {
          user: authData.user || authData,
          token: authData.token
        }
      });
    }
  }

  static async logout() {
    this.clearAuth();
  }

  static getAuthData() {
    try {
      const raw = localStorage.getItem("authData");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  static isAuthenticated() {
    const authData = this.getAuthData();
    console.log("AuthService isAuthenticated check:", authData);
    return authData?.timestamp + authData?.expiresIn * 1000 > Date.now();
  }

  static getAccessToken() {
    const authData = this.getAuthData();
    return authData?.token || null;
  }

  static #storeAuthData(data) {
    localStorage.setItem("authData", JSON.stringify(data));
  }

  static #clearAuthData() {
    console.log("Clearing auth data from localStorage");
    localStorage.removeItem("authData");
  }

  static #persistAuth(authData) {
    this.#storeAuthData(authData);
    store.dispatch({
      type: "auth/loginSuccess",
      payload: {
        user: authData.user || authData,
        token: authData.token
      }
    });
  }

  static clearAuth() {
    this.#clearAuthData();
    store.dispatch({ type: "auth/logoutSuccess" });
  }
}

export default AuthService;
