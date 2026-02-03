import React, { useContext } from "react";
import { Redirect, Route } from "react-router-dom";
import { AdminContext } from "@/context/AdminContext";
import AuthService from "@/services/AuthService";

// components/login/PrivateRoute.js
const PrivateRoute = ({ children, ...rest }) => {
  const { state } = useContext(AdminContext);
  // const isAuthenticated = AuthService.isAuthenticated() || state.authData;
  const isAuthenticated = AuthService.isAuthenticated();
  console.log("PrivateRoute isAuthenticated:", isAuthenticated);
  return (
    <Route
      {...rest}
      render={({ location }) =>
        isAuthenticated ? (
          children
        ) : (
          <Redirect to={{ pathname: "/login", state: { from: location } }} />
        )
      }
    />
  );
};

export default PrivateRoute;
