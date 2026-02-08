import "@styles/custom.css";
import { CartProvider } from "react-use-cart";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { Provider } from "react-redux";
import ReactGA from "react-ga4";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import TawkMessengerReact from "@tawk.to/tawk-messenger-react";

//internal import
import store from "@redux/store";
import useAsync from "@hooks/useAsync";
import { handlePageView } from "@lib/analytics";
import { UserProvider } from "@context/UserContext";
import DefaultSeo from "@components/common/DefaultSeo";
import { SidebarProvider } from "@context/SidebarContext";
import SettingServices from "@services/SettingServices";

let persistor = persistStore(store);

const placeholderStripePromise = Promise.resolve(null);

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [stripePromise, setStripePromise] = useState(placeholderStripePromise);

  const {
    data: storeSetting,
    loading,
    error,
  } = useAsync(SettingServices.getStoreSetting);

  useEffect(() => {
    // Initialize Google Analytics
    if (!loading && !error && storeSetting?.google_analytic_status) {
      ReactGA.initialize(storeSetting?.google_analytic_key || "");

      // Initial page load
      handlePageView();

      // Track page view on route change
      const handleRouteChange = (url) => {
        handlePageView(`/${router.pathname}`, "Sat & Buy");
      };

      // Set up event listeners
      router.events.on("routeChangeComplete", handleRouteChange);

      return () => {
        router.events.off("routeChangeComplete", handleRouteChange);
      };
    }
  }, [storeSetting]);

  useEffect(() => {
    if (!loading && !error && storeSetting?.stripe_key) {
      setStripePromise(loadStripe(storeSetting?.stripe_key));
    }
  }, [loading, error, storeSetting]);

  // Remount Elements when the publishable key changes so hooks always see the correct context.
  const elementsKey = useMemo(
    () => (storeSetting?.stripe_key ? `stripe-${storeSetting?.stripe_key}` : "stripe-placeholder"),
    [storeSetting?.stripe_key]
  );

  return (
    <>
      {!loading && !error && storeSetting?.tawk_chat_status && (
        <TawkMessengerReact
          propertyId={storeSetting?.tawk_chat_property_id || ""}
          widgetId={storeSetting?.tawk_chat_widget_id || ""}
        />
      )}

      <UserProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <SidebarProvider>
              <Elements key={elementsKey} stripe={stripePromise}>
                <CartProvider>
                  <DefaultSeo />
                  <Component {...pageProps} />
                </CartProvider>
              </Elements>
            </SidebarProvider>
          </PersistGate>
        </Provider>
      </UserProvider>
    </>
  );
}

export default MyApp;
