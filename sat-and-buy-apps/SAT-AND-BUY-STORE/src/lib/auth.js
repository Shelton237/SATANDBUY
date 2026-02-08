import Cookies from "js-cookie";

const USER_SESSION_KEY = "userInfo";

const hasWindow = () => typeof window !== "undefined";

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch (err) {
    return null;
  }
};

const normalizeUser = (payload) => {
  if (!payload || typeof payload !== "object") return payload;
  if (!payload.id && payload._id) {
    return { ...payload, id: payload._id };
  }
  return payload;
};

const readFromStorage = () => {
  if (!hasWindow()) return null;
  const raw = window.localStorage.getItem(USER_SESSION_KEY);
  return raw ? normalizeUser(safeParse(raw)) : null;
};

const readFromCookie = () => {
  if (!hasWindow()) return null;
  const raw = Cookies.get(USER_SESSION_KEY);
  return raw ? normalizeUser(safeParse(raw)) : null;
};

const getUserSession = () => {
  return readFromStorage() || readFromCookie();
};

const persistUserSession = (payload) => {
  if (!payload) return;
  const normalized = normalizeUser(payload);
  if (hasWindow()) {
    window.localStorage.setItem(USER_SESSION_KEY, JSON.stringify(normalized));
  }
  Cookies.set(USER_SESSION_KEY, JSON.stringify(normalized), {
    path: "/",
    sameSite: "lax",
  });
};

const clearUserSession = () => {
  if (hasWindow()) {
    window.localStorage.removeItem(USER_SESSION_KEY);
  }
  Cookies.remove(USER_SESSION_KEY);
};

export { getUserSession, persistUserSession, clearUserSession };
