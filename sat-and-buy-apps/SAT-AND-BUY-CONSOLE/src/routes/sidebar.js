import {
  FiGrid,
  FiUsers,
  FiUser,
  FiCompass,
  FiSettings,
  FiSlack,
  FiGlobe,
  FiTarget,
  FiTruck,
  FiClipboard,
} from "react-icons/fi";
import { STAFF_ROLE_VALUES } from "@/constants/roles";

const ADMIN_ONLY = ["Admin"];
const CATALOG_ROLES = ["Admin", "Vendeur"];
const ORDER_ROLES = ["Admin", "Trieur"];
const DELIVERY_ROLES = ["Admin", "Trieur", "Livreur"];
const LOGISTICS_ROLES = ["Admin", "Livreur"];

/**
 * ⚠ These are used just to render the Sidebar!
 * You can include any link here, local or external.
 *
 * If you're looking to actual Router routes, go to
 * `routes/index.js`
 */
const sidebar = [
  {
    path: "/dashboard", // the url
    icon: FiGrid, // icon
    name: "Dashboard", // name that appear in Sidebar
    allowedRoles: STAFF_ROLE_VALUES,
  },

  {
    icon: FiSlack,
    name: "Catalog",
    allowedRoles: CATALOG_ROLES,
    routes: [
      {
        path: "/products",
        name: "Products",
        allowedRoles: CATALOG_ROLES,
      },
      {
        path: "/categories",
        name: "Categories",
        allowedRoles: CATALOG_ROLES,
      },
      {
        path: "/attributes",
        name: "Attributes",
        allowedRoles: CATALOG_ROLES,
      },
      // {
      //   path: "/coupons",
      //   name: "Coupons",
      // },
    ],
  },

  {
    path: "/customers",
    icon: FiUsers,
    name: "Customers",
    allowedRoles: ADMIN_ONLY,
  },
  {
    path: "/orders",
    icon: FiCompass,
    name: "Orders",
    allowedRoles: ORDER_ROLES,
  },
  {
    path: "/orders/board",
    icon: FiCompass,
    name: "OrderBoard",
    allowedRoles: DELIVERY_ROLES,
  },
  {
    path: "/market-requests",
    icon: FiClipboard,
    name: "MarketRequests",
    allowedRoles: ADMIN_ONLY,
  },

  {
    path: "/our-staff",
    icon: FiUser,
    name: "OurStaff",
    allowedRoles: ADMIN_ONLY,
  },
  {
    path: "/shipping-rates",
    icon: FiTruck,
    name: "ShippingRates",
    allowedRoles: LOGISTICS_ROLES,
  },

  {
    path: "/settings?settingTab=common-settings",
    icon: FiSettings,
    name: "Settings",
    allowedRoles: ADMIN_ONLY,
  },
  {
    icon: FiGlobe,
    name: "International",
    allowedRoles: ADMIN_ONLY,
    routes: [
      {
        path: "/languages",
        name: "Languages",
        allowedRoles: ADMIN_ONLY,
      },
      {
        path: "/currencies",
        name: "Currencies",
        allowedRoles: ADMIN_ONLY,
      },
    ],
  },
  {
    icon: FiTarget,
    name: "OnlineStore",
    allowedRoles: ADMIN_ONLY,
    routes: [
      {
        name: "ViewStore",
        path: "http://localhost:3000",
        outside: "store",
      },

      {
        path: "/store/customization",
        name: "StoreCustomization",
        allowedRoles: ADMIN_ONLY,
      },
      {
        path: "/store/store-settings",
        name: "StoreSettings",
        allowedRoles: ADMIN_ONLY,
      },
    ],
  },

];

export default sidebar;
