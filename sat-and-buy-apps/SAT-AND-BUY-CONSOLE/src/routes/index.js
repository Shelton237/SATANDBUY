import { lazy } from "react";
import { STAFF_ROLE_VALUES } from "@/constants/roles";

// use lazy for better code splitting
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Attributes = lazy(() => import("@/pages/Attributes"));
const ChildAttributes = lazy(() => import("@/pages/ChildAttributes"));
const Products = lazy(() => import("@/pages/Products"));
const ProductDetails = lazy(() => import("@/pages/ProductDetails"));
const Category = lazy(() => import("@/pages/Category"));
const ChildCategory = lazy(() => import("@/pages/ChildCategory"));
const Staff = lazy(() => import("@/pages/Staff"));
const Customers = lazy(() => import("@/pages/Customers"));
const CustomerOrder = lazy(() => import("@/pages/CustomerOrder"));
const Orders = lazy(() => import("@/pages/Orders"));
const OrderBoard = lazy(() => import("@/pages/OrderBoard"));
const OrderInvoice = lazy(() => import("@/pages/OrderInvoice"));
const Coupons = lazy(() => import("@/pages/Coupons"));
// const Setting = lazy(() => import("@/pages/Setting"));
const Page404 = lazy(() => import("@/pages/404"));
const ComingSoon = lazy(() => import("@/pages/ComingSoon"));
const EditProfile = lazy(() => import("@/pages/EditProfile"));
const Languages = lazy(() => import("@/pages/Languages"));
const Currencies = lazy(() => import("@/pages/Currencies"));
const Setting = lazy(() => import("@/pages/Setting"));
const StoreHome = lazy(() => import("@/pages/StoreHome"));
const StoreSetting = lazy(() => import("@/pages/StoreSetting"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const ShippingRates = lazy(() => import("@/pages/ShippingRates"));
const MarketListRequests = lazy(() => import("@/pages/MarketListRequests"));
/*
//  * ⚠ These are internal routes!
//  * They will be rendered inside the app, using the default `containers/Layout`.
//  * If you want to add a route to, let's say, a landing page, you should add
//  * it to the `App`'s router, exactly like `Login`, `CreateAccount` and other pages
//  * are routed.
//  *
//  * If you're looking for the links rendered in the SidebarContent, go to
//  * `routes/sidebar.js`
 */

const STAFF_ONLY = STAFF_ROLE_VALUES;
const ADMIN_ONLY = ["Admin"];
const CATALOG_ROLES = ["Admin", "Vendeur"];
const ORDER_ROLES = ["Admin", "Trieur"];
const DELIVERY_ROLES = ["Admin", "Trieur", "Livreur"];
const LOGISTICS_ROLES = ["Admin", "Livreur"];

const routes = [
  {
    path: "/dashboard",
    component: Dashboard,
    allowedRoles: STAFF_ONLY,
  },
  {
    path: "/products",
    component: Products,
    allowedRoles: CATALOG_ROLES,
  },
  {
    path: "/attributes",
    component: Attributes,
    allowedRoles: CATALOG_ROLES,
  },
  {
    path: "/attributes/:code",
    component: ChildAttributes,
    allowedRoles: CATALOG_ROLES,
  },
  {
    path: "/product/:id",
    component: ProductDetails,
    allowedRoles: CATALOG_ROLES,
  },
  {
    path: "/categories",
    component: Category,
    allowedRoles: CATALOG_ROLES,
  },
  {
    path: "/languages",
    component: Languages,
    allowedRoles: ADMIN_ONLY,
  },
  {
    path: "/currencies",
    component: Currencies,
    allowedRoles: ADMIN_ONLY,
  },

  {
    path: "/categories/:id",
    component: ChildCategory,
    allowedRoles: CATALOG_ROLES,
  },
  {
    path: "/customers",
    component: Customers,
    allowedRoles: ADMIN_ONLY,
  },
  {
    path: "/customer-order/:id",
    component: CustomerOrder,
    allowedRoles: ADMIN_ONLY,
  },
  {
    path: "/our-staff",
    component: Staff,
    allowedRoles: ADMIN_ONLY,
  },
  {
    path: "/orders",
    component: Orders,
    allowedRoles: ORDER_ROLES,
  },
  {
    path: "/orders/board",
    component: OrderBoard,
    allowedRoles: DELIVERY_ROLES,
  },
  {
    path: "/market-requests",
    component: MarketListRequests,
    allowedRoles: ADMIN_ONLY,
  },
  {
    path: "/order/:id",
    component: OrderInvoice,
    allowedRoles: ORDER_ROLES,
  },
  // {
  //   path: "/coupons",
  //   component: Coupons,
  // },
  { path: "/settings", component: Setting, allowedRoles: ADMIN_ONLY },
  {
    path: "/store/customization",
    component: StoreHome,
    allowedRoles: ADMIN_ONLY,
  },
  {
    path: "/store/store-settings",
    component: StoreSetting,
    allowedRoles: ADMIN_ONLY,
  },
  {
    path: "/404",
    component: Page404,
  },
  {
    path: "/coming-soon",
    component: ComingSoon,
  },
  {
    path: "/edit-profile",
    component: EditProfile,
    allowedRoles: STAFF_ONLY,
  },
  {
    path: "/notifications",
    component: Notifications,
    allowedRoles: STAFF_ONLY,
  },
  {
    path: "/shipping-rates",
    component: ShippingRates,
    allowedRoles: LOGISTICS_ROLES,
  },
];

export default routes;
