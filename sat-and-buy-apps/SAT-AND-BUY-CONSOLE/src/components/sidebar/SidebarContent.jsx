import React, { useCallback, useContext, useMemo } from "react";
import { NavLink, Route, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@windmill/react-ui";
import { IoLogOutOutline } from "react-icons/io5";

//internal import
import sidebarConfig from "@/routes/sidebar";
// import SidebarSubMenu from "SidebarSubMenu";
import logo from "@/assets/img/logo/logo-text.png";
import { AdminContext } from "@/context/AdminContext";
import SidebarSubMenu from "@/components/sidebar/SidebarSubMenu";
import AuthService from "@/services/AuthService";
import { notifyError } from "@/utils/toast";
import { STAFF_ROLE_VALUES } from "@/constants/roles";

const SidebarContent = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { dispatch, authData } = useContext(AdminContext);

  const handleLogOut = async () => {
    try {
      await AuthService.logout();
      dispatch({ type: "USER_LOGOUT" });
      history.replace("/login");
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
    }
  };

  const currentRole = useMemo(() => {
    const role = authData?.user?.role || authData?.role;
    if (role && STAFF_ROLE_VALUES.includes(role)) {
      return role;
    }
    return "Admin";
  }, [authData]);

  const filterMenuItems = useCallback((items) => {
    const role = currentRole;
    return items.reduce((acc, item) => {
      const allowedRoles =
        item.allowedRoles && item.allowedRoles.length
          ? item.allowedRoles
          : STAFF_ROLE_VALUES;
      if (!allowedRoles.includes(role)) {
        return acc;
      }
      if (item.routes) {
        const childRoutes = filterMenuItems(item.routes);
        if (childRoutes.length === 0) {
          return acc;
        }
        acc.push({ ...item, routes: childRoutes });
      } else {
        acc.push(item);
      }
      return acc;
    }, []);
  }, [currentRole]);

  const sidebarRoutes = useMemo(
    () => filterMenuItems(sidebarConfig),
    [filterMenuItems]
  );

  return (
    <div className="py-4 text-gray-500 dark:text-gray-400 ">
      <div className="">
        <a className="" href="/dashboard">
          <img src={logo} alt="kachabazar" width="150" className="pl-6" />
        </a>
      </div>

      <ul className="mt-8">
        {sidebarRoutes.map((route) =>
          route.routes ? (
            <SidebarSubMenu route={route} key={route.name} />
          ) : (
            <li className="relative" key={route.name}>
              <NavLink
                exact
                to={route.path}
                target={`${route?.outside ? "_blank" : "_self"}`}
                className="px-6 py-4 inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-emerald-700 dark:hover:text-gray-200"
                // activeClassName="text-emerald-500 dark:text-gray-100"
                activeStyle={{
                  color: "#0d9e6d",
                }}
                rel="noreferrer"
              >
                <Route path={route.path} exact={route.exact}>
                  <span
                    className="absolute inset-y-0 left-0 w-1 bg-emerald-500 rounded-tr-lg rounded-br-lg"
                    aria-hidden="true"
                  ></span>
                </Route>
                <route.icon className="w-5 h-5" aria-hidden="true" />
                <span className="ml-4">{t(`${route.name}`)}</span>
              </NavLink>
            </li>
          )
        )}
      </ul>
      <span className="lg:fixed bottom-0 px-6 py-6 w-64 mx-auto relative mt-3 block">
        <Button onClick={handleLogOut} size="large" className="w-full">
          <span className="flex items-center">
            <IoLogOutOutline className="mr-3 text-lg" />
            <span className="text-sm">{t("LogOut")}</span>
          </span>
        </Button>
      </span>
    </div>
  );
};

export default SidebarContent;
