// config/keycloak.js
export const KEYCLOAK_HOST = "https://security.dreamdigital.cm";
export const KEYCLOAK_REALM = "master";
export const KEYCLOAK_BASE_URL = `${KEYCLOAK_HOST}/realms/${KEYCLOAK_REALM}`;
export const KEYCLOAK_ADMIN_BASE = `${KEYCLOAK_HOST}/admin/realms/${KEYCLOAK_REALM}`;

export const KEYCLOAK_CONFIG = {
  clientId: "ecommerce-client",
  clientSecret: "WzMICFqhv5e2BgWGMreBndDlbg3IjO4H",
  tokenEndpoint: "protocol/openid-connect/token",
  userInfoEndpoint: "protocol/openid-connect/userinfo",
  logoutEndpoint: "protocol/openid-connect/logout"
};