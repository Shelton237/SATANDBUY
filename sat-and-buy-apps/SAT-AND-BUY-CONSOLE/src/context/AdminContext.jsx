import React, {
  createContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import AuthService from "@/services/AuthService";

export const AdminContext = createContext();

const initialState = {
  authData: AuthService.getAuthData() || null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "USER_LOGIN":
    case "UPDATE_AUTH":
      return { ...state, authData: action.payload };
    case "USER_LOGOUT":
    case "CLEAR_AUTH":
      return { ...state, authData: null };
    default:
      return state;
  }
};

export const AdminProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const syncAuth = useCallback(() => {
    const authData = AuthService.getAuthData();
    dispatch({
      type: authData ? "USER_LOGIN" : "USER_LOGOUT",
      payload: authData,
    });
  }, []);

  useEffect(() => {
    syncAuth();
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, [syncAuth]);

  const handleLogin = async (...args) => {
    const authData = await AuthService.login(...args);
    dispatch({ type: "USER_LOGIN", payload: authData });
    return authData;
  };

  const handleLogout = async () => {
    await AuthService.logout();
    dispatch({ type: "USER_LOGOUT" });
  };

  return (
    <AdminContext.Provider
      value={{
        state,
        dispatch,
        authData: state.authData,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
