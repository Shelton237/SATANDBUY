import {
  Pagination,
  Table,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
  WindmillContext,
} from "@windmill/react-ui";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  FiCheck,
  FiRefreshCw,
  FiShoppingCart,
  FiTruck,
  FiPackage,
  FiLayers,
  FiTag,
} from "react-icons/fi";
import { ImCreditCard, ImStack } from "react-icons/im";

//internal import
import useAsync from "@/hooks/useAsync";
import useFilter from "@/hooks/useFilter";
import LineChart from "@/components/chart/LineChart/LineChart";
import PieChart from "@/components/chart/Pie/PieChart";
import CardItem from "@/components/dashboard/CardItem";
import CardItemTwo from "@/components/dashboard/CardItemTwo";
import ChartCard from "@/components/chart/ChartCard";
import OrderTable from "@/components/order/OrderTable";
import TableLoading from "@/components/preloader/TableLoading";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import { SidebarContext } from "@/context/SidebarContext";
import OrderServices from "@/services/OrderServices";
import AnimatedContent from "@/components/common/AnimatedContent";
import { AdminContext } from "@/context/AdminContext";

const EMPTY_RESPONSE = {};
const EMPTY_ORDER_RESPONSE = { orders: [], ordersData: [], totalOrder: 0 };

const noopFetcher = async () => EMPTY_RESPONSE;
const noopOrdersFetcher = async () => EMPTY_ORDER_RESPONSE;

const Dashboard = () => {
  const { t } = useTranslation();
  const { mode } = useContext(WindmillContext);
  const { authData } = useContext(AdminContext);

  dayjs.extend(isBetween);
  dayjs.extend(isToday);
  dayjs.extend(isYesterday);

  const { currentPage, handleChangePage } = useContext(SidebarContext);
  const currentRole = authData?.user?.role || authData?.role || "Admin";
  const isVendor = currentRole === "Vendeur";

  // react hook
  const [todayOrderAmount, setTodayOrderAmount] = useState(0);
  const [yesterdayOrderAmount, setYesterdayOrderAmount] = useState(0);
  const [salesReport, setSalesReport] = useState([]);
  const [todayCashPayment, setTodayCashPayment] = useState(0);
  const [todayCardPayment, setTodayCardPayment] = useState(0);
  const [todayCreditPayment, setTodayCreditPayment] = useState(0);
  const [yesterdayCashPayment, setYesterdayCashPayment] = useState(0);
  const [yesterdayCardPayment, setYesterdayCardPayment] = useState(0);
  const [yesterdayCreditPayment, setYesterdayCreditPayment] = useState(0);

  const {
    data: bestSellerProductChart,
    loading: loadingBestSellerProduct,
    error,
  } = useAsync(
    isVendor ? noopFetcher : OrderServices.getBestSellerProductChart
  );

  const { data: dashboardRecentOrder, loading: loadingRecentOrder } = useAsync(
    isVendor
      ? noopOrdersFetcher
      : () => OrderServices.getDashboardRecentOrder({ page: currentPage, limit: 8 })
  );

  const { data: dashboardOrderCount, loading: loadingOrderCount } = useAsync(
    isVendor ? noopFetcher : OrderServices.getDashboardCount
  );

  const { data: dashboardOrderAmount, loading: loadingOrderAmount } = useAsync(
    isVendor ? noopFetcher : OrderServices.getDashboardAmount
  );

  // console.log("dashboardOrderCount", dashboardOrderCount);

  const recentOrdersSource = isVendor ? [] : dashboardRecentOrder?.orders;
  const { dataTable, serviceData } = useFilter(recentOrdersSource);

  useEffect(() => {
    if (isVendor || !dashboardOrderAmount?.ordersData) {
      setTodayOrderAmount(0);
      setYesterdayOrderAmount(0);
      setSalesReport([]);
      setTodayCashPayment(0);
      setTodayCardPayment(0);
      setTodayCreditPayment(0);
      setYesterdayCashPayment(0);
      setYesterdayCardPayment(0);
      setYesterdayCreditPayment(0);
      return;
    }

    // today orders show
    const todayOrder = dashboardOrderAmount?.ordersData?.filter((order) =>
      dayjs(order.updatedAt).isToday()
    );
    //  console.log('todayOrder',dashboardOrderAmount.ordersData)
    const todayReport = todayOrder?.reduce((pre, acc) => pre + acc.total, 0);
    setTodayOrderAmount(todayReport);

    // yesterday orders
    const yesterdayOrder = dashboardOrderAmount?.ordersData?.filter((order) =>
      dayjs(order.updatedAt).set(-1, "day").isYesterday()
    );

    const yesterdayReport = yesterdayOrder?.reduce(
      (pre, acc) => pre + acc.total,
      0
    );
    setYesterdayOrderAmount(yesterdayReport);

    // sales orders chart data
    const salesOrderChartData = dashboardOrderAmount?.ordersData?.filter(
      (order) =>
        dayjs(order.updatedAt).isBetween(
          new Date().setDate(new Date().getDate() - 7),
          new Date()
        )
    );

    salesOrderChartData?.reduce((res, value) => {
      let onlyDate = value.updatedAt.split("T")[0];

      if (!res[onlyDate]) {
        res[onlyDate] = { date: onlyDate, total: 0, order: 0 };
        salesReport.push(res[onlyDate]);
      }
      res[onlyDate].total += value.total;
      res[onlyDate].order += 1;
      return res;
    }, {});

    setSalesReport(salesReport);

    const todayPaymentMethodData = [];
    const yesterDayPaymentMethodData = [];

    // today order payment method
    dashboardOrderAmount?.ordersData?.filter((item, value) => {
      if (dayjs(item.updatedAt).isToday()) {
        if (item.paymentMethod === "Cash") {
          let cashMethod = {
            paymentMethod: "Cash",
            total: item.total,
          };
          todayPaymentMethodData.push(cashMethod);
        }

        if (item.paymentMethod === "Credit") {
          const cashMethod = {
            paymentMethod: "Credit",
            total: item.total,
          };

          todayPaymentMethodData.push(cashMethod);
        }

        if (item.paymentMethod === "Card") {
          const cashMethod = {
            paymentMethod: "Card",
            total: item.total,
          };

          todayPaymentMethodData.push(cashMethod);
        }
      }

      return item;
    });
    // yesterday order payment method
    dashboardOrderAmount?.ordersData?.filter((item, value) => {
      if (dayjs(item.updatedAt).set(-1, "day").isYesterday()) {
        if (item.paymentMethod === "Cash") {
          let cashMethod = {
            paymentMethod: "Cash",
            total: item.total,
          };
          yesterDayPaymentMethodData.push(cashMethod);
        }

        if (item.paymentMethod === "Credit") {
          const cashMethod = {
            paymentMethod: "Credit",
            total: item?.total,
          };

          yesterDayPaymentMethodData.push(cashMethod);
        }

        if (item.paymentMethod === "Card") {
          const cashMethod = {
            paymentMethod: "Card",
            total: item?.total,
          };

          yesterDayPaymentMethodData.push(cashMethod);
        }
      }

      return item;
    });

    const todayCsCdCit = Object.values(
      todayPaymentMethodData.reduce((r, { paymentMethod, total }) => {
        if (!r[paymentMethod]) {
          r[paymentMethod] = { paymentMethod, total: 0 };
        }
        r[paymentMethod].total += total;

        return r;
      }, {})
    );
    const today_cash_payment = todayCsCdCit.find(
      (el) => el.paymentMethod === "Cash"
    );
    setTodayCashPayment(today_cash_payment?.total);
    const today_card_payment = todayCsCdCit.find(
      (el) => el.paymentMethod === "Card"
    );
    setTodayCardPayment(today_card_payment?.total);
    const today_credit_payment = todayCsCdCit.find(
      (el) => el.paymentMethod === "Credit"
    );
    setTodayCreditPayment(today_credit_payment?.total);

    const yesterDayCsCdCit = Object.values(
      yesterDayPaymentMethodData.reduce((r, { paymentMethod, total }) => {
        if (!r[paymentMethod]) {
          r[paymentMethod] = { paymentMethod, total: 0 };
        }
        r[paymentMethod].total += total;

        return r;
      }, {})
    );
    const yesterday_cash_payment = yesterDayCsCdCit.find(
      (el) => el.paymentMethod === "Cash"
    );
    setYesterdayCashPayment(yesterday_cash_payment?.total);
    const yesterday_card_payment = yesterDayCsCdCit.find(
      (el) => el.paymentMethod === "Card"
    );
    setYesterdayCardPayment(yesterday_card_payment?.total);
    const yesterday_credit_payment = yesterDayCsCdCit.find(
      (el) => el.paymentMethod === "Credit"
    );
    setYesterdayCreditPayment(yesterday_credit_payment?.total);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardOrderAmount, isVendor]);

  if (isVendor) {
    const vendorShortcuts = [
      {
        href: "/products",
        title: "Gérer vos produits",
        description: "Ajoutez ou mettez à jour votre catalogue.",
        Icon: FiPackage,
      },
      {
        href: "/categories",
        title: "Catégories",
        description: "Organisez vos articles par catégorie.",
        Icon: FiLayers,
      },
      {
        href: "/attributes",
        title: "Attributs",
        description: "Définissez les variantes et caractéristiques produits.",
        Icon: FiTag,
      },
    ];

    return (
      <>
        <PageTitle title="Espace vendeur" />
        <AnimatedContent>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Gestion du catalogue
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Votre accès est dédié à la mise à jour des contenus produits.
              Utilisez les raccourcis ci-dessous pour tenir votre boutique à
              jour. Les commandes et le suivi logistique restent gérés par
              l&apos;équipe administrative.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
              {vendorShortcuts.map(({ href, title, description, Icon }) => (
                <Link
                  key={href}
                  to={href}
                  className="border border-emerald-100 dark:border-emerald-900 hover:border-emerald-500 rounded-lg p-4 transition-colors bg-emerald-50 dark:bg-emerald-900/30"
                >
                  <div className="flex items-center mb-3 text-emerald-600 dark:text-emerald-300">
                    <Icon className="text-xl mr-2" />
                    <span className="font-semibold">{title}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </AnimatedContent>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Sat & Buy Dashboard" />

      <AnimatedContent>
        <div className="grid gap-2 mb-8 xl:grid-cols-5 md:grid-cols-2">
          <CardItemTwo
            mode={mode}
            title="Today Order"
            title2="TodayOrder"
            Icon={ImStack}
            cash={todayCashPayment || 0}
            card={todayCardPayment || 0}
            credit={todayCreditPayment || 0}
            price={todayOrderAmount || 0}
            className="text-white dark:text-emerald-100 bg-teal-600"
            loading={loadingOrderAmount}
          />

          <CardItemTwo
            mode={mode}
            title="Yesterday Order"
            title2="YesterdayOrder"
            Icon={ImStack}
            cash={yesterdayCashPayment || 0}
            card={yesterdayCardPayment || 0}
            credit={yesterdayCreditPayment || 0}
            price={yesterdayOrderAmount || 0}
            className="text-white dark:text-orange-100 bg-orange-400"
            loading={loadingOrderAmount}
          />

          <CardItemTwo
            mode={mode}
            title2="ThisMonth"
            Icon={FiShoppingCart}
            price={dashboardOrderAmount?.thisMonthlyOrderAmount || 0}
            className="text-white dark:text-emerald-100 bg-blue-500"
            loading={loadingOrderAmount}
          />

          <CardItemTwo
            mode={mode}
            title2="LastMonth"
            Icon={ImCreditCard}
            loading={loadingOrderAmount}
            price={dashboardOrderAmount?.lastMonthOrderAmount || 0}
            className="text-white dark:text-teal-100 bg-cyan-600"
          />

          <CardItemTwo
            mode={mode}
            title2="AllTimeSales"
            Icon={ImCreditCard}
            price={dashboardOrderAmount?.totalAmount || 0}
            className="text-white dark:text-emerald-100 bg-emerald-600"
            loading={loadingOrderAmount}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <CardItem
            title="Total Order"
            Icon={FiShoppingCart}
            loading={loadingOrderCount}
            quantity={dashboardOrderCount?.totalOrder || 0}
            className="text-orange-600 dark:text-orange-100 bg-orange-100 dark:bg-orange-500"
          />
          <CardItem
            title={t("OrderPending")}
            Icon={FiRefreshCw}
            loading={loadingOrderCount}
            quantity={dashboardOrderCount?.totalPendingOrder?.count || 0}
            amount={dashboardOrderCount?.totalPendingOrder?.total || 0}
            className="text-blue-600 dark:text-blue-100 bg-blue-100 dark:bg-blue-500"
          />
          <CardItem
            title={t("OrderProcessing")}
            Icon={FiTruck}
            loading={loadingOrderCount}
            quantity={dashboardOrderCount?.totalProcessingOrder || 0}
            className="text-teal-600 dark:text-teal-100 bg-teal-100 dark:bg-teal-500"
          />
          <CardItem
            title={t("OrderDelivered")}
            Icon={FiCheck}
            loading={loadingOrderCount}
            quantity={dashboardOrderCount?.totalDeliveredOrder || 0}
            className="text-emerald-600 dark:text-emerald-100 bg-emerald-100 dark:bg-emerald-500"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 my-8">
          <ChartCard
            mode={mode}
            loading={loadingOrderAmount}
            title={t("WeeklySales")}
          >
            <LineChart salesReport={salesReport} />
          </ChartCard>

          <ChartCard
            mode={mode}
            loading={loadingBestSellerProduct}
            title={t("BestSellingProducts")}
          >
            <PieChart data={bestSellerProductChart} />
          </ChartCard>
        </div>
      </AnimatedContent>

      <PageTitle>{t("RecentOrder")}</PageTitle>

      {/* <Loading loading={loading} /> */}

      {loadingRecentOrder ? (
        <TableLoading row={5} col={4} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : serviceData?.length !== 0 ? (
        <TableContainer className="mb-8">
          <Table>
            <TableHeader>
              <tr>
                <TableCell>{t("InvoiceNo")}</TableCell>
                <TableCell>{t("TimeTbl")}</TableCell>
                <TableCell>{t("CustomerName")} </TableCell>
                <TableCell> {t("MethodTbl")} </TableCell>
                <TableCell> {t("AmountTbl")} </TableCell>
                <TableCell>{t("OderStatusTbl")}</TableCell>
                <TableCell>{t("ActionTbl")}</TableCell>
                <TableCell className="text-right">{t("InvoiceTbl")}</TableCell>
              </tr>
            </TableHeader>

            <OrderTable orders={dataTable} />
          </Table>
          <TableFooter>
            <Pagination
              totalResults={dashboardRecentOrder?.totalOrder}
              resultsPerPage={8}
              onChange={handleChangePage}
              label="Table navigation"
            />
          </TableFooter>
        </TableContainer>
      ) : (
        <NotFound title="Sorry, There are no orders right now." />
      )}
    </>
  );
};

export default Dashboard;
