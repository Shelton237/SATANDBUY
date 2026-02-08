import Cookies from "js-cookie";
import { createContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

//internal import
// import { addSetting, removeSetting } from "@/reduxStore/slice/settingSlice";

const SUPPORTED_LANGUAGES = ["en", "fr"];
const normalizeLanguage = (langCode) => {
  const base = (langCode || "").split("-")[0]?.toLowerCase();
  return SUPPORTED_LANGUAGES.includes(base) ? base : "en";
};

// create context
export const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const resultsPerPage = 20;
  const searchRef = useRef("");
  const invoiceRef = useRef("");
  // const dispatch = useDispatch();

  const [limitData, setLimitData] = useState(20);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBulkDrawerOpen, setIsBulkDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [lang, setLang] = useState("en");
  const [time, setTime] = useState("");
  const [sortedField, setSortedField] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [zone, setZone] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [method, setMethod] = useState("");
  const [owner, setOwner] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [windowDimension, setWindowDimension] = useState(window.innerWidth);
  const [loading, setLoading] = useState(false);
  const [navBar, setNavBar] = useState(true);
  const { i18n } = useTranslation();
  const [serviceId, setServiceId] = useState(null);
  const [allId, setAllId] = useState([]);
  const [title, setTitle] = useState("");
  const [tabIndex, setTabIndex] = useState(0);

  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const closeBulkDrawer = () => setIsBulkDrawerOpen(false);
  const toggleBulkDrawer = () => setIsBulkDrawerOpen(!isBulkDrawerOpen);

  const closeModal = () => setIsModalOpen(false);
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleLanguageChange = (langCode) => {
    const nextLang = normalizeLanguage(langCode);
    Cookies.set("i18next", nextLang, {
      sameSite: "None",
      secure: true,
    });
    i18n.changeLanguage(nextLang);
    setLang(nextLang);
  };

  const handleChangePage = (p) => {
    setCurrentPage(p);
  };

  const handleSubmitForAll = (e) => {
    e.preventDefault();
    if (!searchRef?.current?.value) return setSearchText(null);
    setSearchText(searchRef?.current?.value);
    setCategory(null);
  };

  useEffect(() => {
    const cookieLang = Cookies.get("i18next");
    const normalized = normalizeLanguage(cookieLang || lang);
    if (normalized !== lang) {
      setLang(normalized);
      i18n.changeLanguage(normalized);
    }
    Cookies.set("i18next", normalized, {
      sameSite: "None",
      secure: true,
    });
  }, [lang, i18n]);

  useEffect(() => {
    function handleResize() {
      setWindowDimension(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // useEffect(() => {
  //   // Listen for the 'notification' event from the server
  //   socket?.on("notification", (notification) => {
  //     // Update data in real-time here
  //     console.log("notification", notification);
  //     if (notification?.option === "globalSetting") {
  //       dispatch(removeSetting("globalSetting"));
  //       const globalSettingData = {
  //         ...res.globalSetting,
  //         name: "globalSetting",
  //       };
  //       dispatch(addSetting(globalSettingData));
  //     }
  //     // if(notification?.option === 'storeCustomizationSetting'){

  //     // }
  //   });

  //   return () => {
  //     // Disconnect the socket when the component unmounts
  //     socket?.disconnect();
  //   };
  // }, []);

  return (
    <SidebarContext.Provider
      value={{
        method,
        setMethod,
        isSidebarOpen,
        toggleSidebar,
        closeSidebar,
        isDrawerOpen,
        toggleDrawer,
        closeDrawer,
        setIsDrawerOpen,
        closeBulkDrawer,
        isBulkDrawerOpen,
        toggleBulkDrawer,
        isModalOpen,
        toggleModal,
        closeModal,
        isUpdate,
        setIsUpdate,
        lang,
        setLang,
        handleLanguageChange,
        currentPage,
        setCurrentPage,
        handleChangePage,
        searchText,
        setSearchText,
        category,
        setCategory,
        searchRef,
        handleSubmitForAll,
        status,
        setStatus,
        zone,
        setZone,
        time,
        setTime,
        sortedField,
        setSortedField,
        resultsPerPage,
        limitData,
        setLimitData,
        windowDimension,
        modalOpen,
        setModalOpen,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        owner,
        setOwner,
        loading,
        setLoading,
        invoice,
        setInvoice,
        invoiceRef,
        setNavBar,
        navBar,
        tabIndex,
        setTabIndex,
        serviceId,
        setServiceId,
        allId,
        setAllId,
        title,
        setTitle,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
