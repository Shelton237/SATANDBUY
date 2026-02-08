import React, { useContext, Suspense, useEffect, lazy, useMemo } from "react";
import { Switch, Route, Redirect, useLocation } from "react-router-dom";

//internal import
import Main from "@/layout/Main";
import routes from "@/routes/index";
import Header from "@/components/header/Header";
import Sidebar from "@/components/sidebar/Sidebar";
import { SidebarContext } from "@/context/SidebarContext";
import ThemeSuspense from "@/components/theme/ThemeSuspense";
import { AdminContext } from "@/context/AdminContext";
import { STAFF_ROLE_VALUES } from "@/constants/roles";
const Page404 = lazy(() => import("@/pages/404"));

const Layout = () => {
  const { isSidebarOpen, closeSidebar, navBar } = useContext(SidebarContext);
  const { authData } = useContext(AdminContext);
  let location = useLocation();

  const isOnline = navigator.onLine;

  // console.log('routes',routes)

  useEffect(() => {
    closeSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const currentRole = useMemo(() => {
    const role = authData?.user?.role || authData?.role;
    if (role && STAFF_ROLE_VALUES.includes(role)) {
      return role;
    }
    return "Admin";
  }, [authData]);

  const renderRoute = (route, index) => {
    const allowedRoles =
      route.allowedRoles && route.allowedRoles.length
        ? route.allowedRoles
        : STAFF_ROLE_VALUES;

    return (
      <Route
        key={`${route.path}-${index}`}
        exact={true}
        path={`${route.path}`}
        render={(props) =>
          allowedRoles.includes(currentRole) ? (
            <route.component {...props} />
          ) : (
            <Redirect to="/dashboard" />
          )
        }
      />
    );
  };

  return (
    <>
      {!isOnline && (
        <div className="flex justify-center bg-red-600 text-white">
          You are in offline mode!{" "}
        </div>
      )}
      <div
        className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${
          isSidebarOpen && "overflow-hidden"
        }`}
      >
        {navBar && <Sidebar />}

        <div className="flex flex-col flex-1 w-full">
          <Header />
          <Main>
            <Suspense fallback={<ThemeSuspense />}>
              <Switch>
                {routes
                  .filter((route) => Boolean(route.component))
                  .map((route, i) => renderRoute(route, i))}
                <Redirect exact from="/" to="/dashboard" />
                <Route component={Page404} />
              </Switch>
            </Suspense>
          </Main>
        </div>
      </div>
    </>
  );
};

export default Layout;
