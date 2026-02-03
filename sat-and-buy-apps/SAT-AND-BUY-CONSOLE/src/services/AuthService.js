import { KEYCLOAK_BASE_URL, KEYCLOAK_CONFIG } from "@/config/keycloak";
import UserService from "@/services/UserService";
import HttpService from "@/services/httpService";
import store from "@/reduxStore/store";

const http = new HttpService(KEYCLOAK_BASE_URL, {
  "Content-Type": "application/x-www-form-urlencoded"
});

class AuthService {
  static async login(username, password) {
    const params = new URLSearchParams();
    params.append("grant_type", "password");
    params.append("client_id", KEYCLOAK_CONFIG.clientId);
    params.append("username", username);
    params.append("password", password);
    params.append("client_secret", KEYCLOAK_CONFIG.clientSecret);
    params.append("scope", "openid");

    const tokenData = (await http.post(KEYCLOAK_CONFIG.tokenEndpoint, params)).data;
    const userInfo = await this.getUserInfo(tokenData.access_token);

    const authData = {
      ...userInfo,
      token: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      timestamp: Date.now()
    };

    this.#persistAuth(authData);
    return authData;
  }

  static async getUserInfo(token) {
    const res = await http.get(`/${KEYCLOAK_CONFIG.userInfoEndpoint}`, token);
    return UserService.mapKeycloakUser(res.data);
  }

  static async refreshToken() {
    const authData = this.getAuthData();
    if (!authData?.refreshToken) throw new Error("No refresh token available");

    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("client_id", KEYCLOAK_CONFIG.clientId);
    params.append("refresh_token", authData.refreshToken);
    params.append("client_secret", KEYCLOAK_CONFIG.clientSecret);

    const tokenData = (await http.post(KEYCLOAK_CONFIG.tokenEndpoint, params)).data;

    const newAuthData = {
      ...authData,
      token: tokenData.access_token,
      refreshToken: tokenData.refresh_token || authData.refreshToken,
      expiresIn: tokenData.expires_in,
      timestamp: Date.now()
    };

    this.#storeAuthData(newAuthData);
    return newAuthData;
  }

  static syncReduxWithLocalStorage() {
    const authData = this.getAuthData();
    if (authData) {
      store.dispatch({
        type: "auth/loginSuccess",
        payload: {
          user: authData,
          token: authData.token
        }
      });
    }
  }

  static async logout() {
    const authData = this.getAuthData();
    if (authData?.refreshToken) {
      const params = new URLSearchParams();
      params.append("client_id", KEYCLOAK_CONFIG.clientId);
      params.append("client_secret", KEYCLOAK_CONFIG.clientSecret);
      params.append("refresh_token", authData.refreshToken);

      try {
        await http.post(KEYCLOAK_CONFIG.logoutEndpoint, params);
        store.dispatch({ type: "auth/logoutSuccess" });
      } catch (err) {
        console.warn("Logout failed:", err.message);
      }
    }
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
      type: "auth/updateAuth",
      payload: authData
    });
  }

  static clearAuth() {
    this.#clearAuthData();
    store.dispatch({ type: "auth/clearAuth" });
  }
}

export default AuthService;