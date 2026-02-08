import Cookies from "js-cookie";
import React, {
  createContext,
  useEffect,
  useReducer,
  useState,
} from "react";

//internal imports
import { setToken } from "@services/httpServices";
import LoadingForSession from "@components/preloader/LoadingForSession";
import { getUserSession } from "@lib/auth";

export const UserContext = createContext();

const isBrowser = typeof window !== "undefined";

const getCookieJSON = (key, fallbackValue) => {
  if (!isBrowser) return fallbackValue;
  const raw = Cookies.get(key);
  if (!raw) return fallbackValue;
  try {
    return JSON.parse(raw);
  } catch (err) {
    return fallbackValue;
  }
};

const initialState = {
  userInfo: getUserSession(),
  shippingAddress: getCookieJSON("shippingAddress", {}),
  couponInfo: getCookieJSON("couponInfo", {}),
};

function reducer(state, action) {
  switch (action.type) {
    case "USER_LOGIN":
      return { ...state, userInfo: action.payload };

    case "USER_LOGOUT":
      return {
        ...state,
        userInfo: null,
      };

    case "SAVE_SHIPPING_ADDRESS":
      return { ...state, shippingAddress: action.payload };

    case "SAVE_COUPON":
      return { ...state, couponInfo: action.payload };
  }
}

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    if (state.userInfo?.token) {
      setToken(state.userInfo.token);
    } else {
      setToken(null);
    }
  }, [state.userInfo]);

  useEffect(() => {
    setBootstrapping(false);
  }, []);

  if (bootstrapping) {
    return <LoadingForSession />;
  }

  const value = { state, dispatch };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
