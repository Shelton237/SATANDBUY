import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { Provider } from "react-redux";
import { Windmill } from "@windmill/react-ui";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import "@fortawesome/fontawesome-free/css/all.min.css";

// internal import
import "rc-tree/assets/index.css";
import "@/assets/css/custom.css";
import "@/assets/css/tailwind.css";
import "react-loading-skeleton/dist/skeleton.css";
import "@/i18n";
import App from "@/App";
import store from "@/reduxStore/store";
import myTheme from "@/assets/theme/myTheme";
import { AdminProvider } from "@/context/AdminContext";
import { SidebarProvider } from "@/context/SidebarContext";
import ThemeSuspense from "@/components/theme/ThemeSuspense";

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New content available. Reload?")) {
      updateSW(true);
    }
  },
});

let persistor = persistStore(store);

ReactDOM.createRoot(document.getElementById("root")).render(
  <AdminProvider>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SidebarProvider>
          <Suspense fallback={<ThemeSuspense />}>
            <Windmill usePreferences theme={myTheme}>
              <App />
            </Windmill>
          </Suspense>
        </SidebarProvider>
      </PersistGate>
    </Provider>
  </AdminProvider>
);
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.register();
