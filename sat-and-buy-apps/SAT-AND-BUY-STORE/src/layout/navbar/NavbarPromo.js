import { Fragment, useState, useEffect, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Transition, Popover } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/outline";
import SettingServices from "@services/SettingServices";
import Cookies from "js-cookie";

//internal import
import { notifyError } from "@utils/toast";
import useGetSetting from "@hooks/useGetSetting";
import Category from "@components/category/Category";
import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";

const NavbarPromo = () => {
  const router = useRouter();
  const [languages, setLanguages] = useState([]);
  const { lang, storeCustomizationSetting } = useGetSetting();
  const { isLoading, setIsLoading } = useContext(SidebarContext);
  const { showingTranslateValue } = useUtilsFunction();

  const currentLanguageFromCookie = Cookies.get("_curr_lang");

  let currentLang = {};
  if (currentLanguageFromCookie && currentLanguageFromCookie !== "undefined") {
    try {
      currentLang = JSON.parse(currentLanguageFromCookie);
    } catch (err) {
      currentLang = {};
    }
  }

  const activeLang = languages?.find(l => l.iso_code === router.locale) || currentLang;

  const handleLanguage = (selectedLang) => {
    Cookies.set("_lang", selectedLang?.iso_code, {
      sameSite: "None",
      secure: true,
    });
    Cookies.set("_curr_lang", JSON.stringify(selectedLang), {
      sameSite: "None",
      secure: true,
    });
    router.push(router.asPath, router.asPath, { locale: selectedLang?.iso_code });
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await SettingServices.getShowingLanguage();
        setLanguages(res);

        const cookieLang = Cookies.get("_curr_lang");
        if (!cookieLang) {
          const result = res?.find((l) => l.iso_code === router.locale) || res?.find((l) => l.iso_code === lang) || res[0];
          if (result) {
            Cookies.set("_curr_lang", JSON.stringify(result), {
              sameSite: "None",
              secure: true,
            });
          }
        }
      } catch (err) {
        notifyError(err);
        console.log("error on getting lang", err);
      }
    })();
  }, [lang, router.locale]);

  return (
    <>
      <div className="hidden lg:block xl:block bg-white border-b">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-10 h-12 flex justify-between items-center">

          {/* Left: main nav links */}
          <nav className="flex items-center space-x-6">
            {storeCustomizationSetting?.navbar?.categories_menu_status && (
              <Popover className="relative font-serif">
                <Popover.Button className="group inline-flex items-center py-2 text-sm font-medium hover:text-emerald-600 focus:outline-none">
                  <span>
                    {showingTranslateValue(storeCustomizationSetting?.navbar?.categories)}
                  </span>
                  <ChevronDownIcon
                    className="ml-1 h-3 w-3 group-hover:text-emerald-600"
                    aria-hidden="true"
                  />
                </Popover.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <Popover.Panel className="absolute z-10 -ml-1 mt-1 transform w-screen max-w-xs c-h-65vh bg-white">
                    <div className="rounded-md shadow-lg ring-1 ring-black ring-opacity-5 overflow-y-scroll flex-grow scrollbar-hide w-full h-full">
                      <Category />
                    </div>
                  </Popover.Panel>
                </Transition>
              </Popover>
            )}

            <Link
              href="/services"
              onClick={() => setIsLoading(!isLoading)}
              className="font-serif text-sm font-semibold text-emerald-600 hover:text-emerald-800"
            >
              Services
            </Link>

            <Link
              href="/boutiques"
              onClick={() => setIsLoading(!isLoading)}
              className="font-serif text-sm font-semibold text-emerald-600 hover:text-emerald-800"
            >
              Boutiques
            </Link>

            {storeCustomizationSetting?.navbar?.offers_menu_status && (
              <Link
                href="/offer"
                onClick={() => setIsLoading(!isLoading)}
                className="relative inline-flex items-center font-serif text-sm font-medium text-red-500 hover:text-emerald-600"
              >
                {showingTranslateValue(storeCustomizationSetting?.navbar?.offers)}
                <div className="absolute flex w-2 h-2 left-auto -right-3 -top-1">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </div>
              </Link>
            )}
          </nav>

          {/* Right: language selector */}
          <div className="dropdown">
            <div className={`flot-l flag ${activeLang?.flag?.toLowerCase()}`}></div>
            <button className="dropbtn uppercase">
              {activeLang?.name || "Language"}
              &nbsp;<i className="fas fa-angle-down"></i>
            </button>
            <div className="dropdown-content">
              {languages?.map((language, i) => (
                <div
                  key={i + 1}
                  onClick={() => handleLanguage(language)}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                >
                  <div className={`flot-l flag ${language?.flag?.toLowerCase()}`}></div>
                  {language?.name}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default NavbarPromo;
