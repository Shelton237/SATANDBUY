import React, { useContext } from "react";

//internal import
import useAsync from "@/hooks/useAsync";
import LanguageServices from "@/services/LanguageServices";
import mockLanguages from "@/utils/mockup/languages";
import { SidebarContext } from "@/context/SidebarContext";

const SUPPORTED_LANGUAGES = ["en", "fr"];

const SelectLanguageTwo = ({ handleSelectLanguage, register }) => {
  const { data, loading, error } = useAsync(
    LanguageServices.getShowingLanguage
  );
  const { lang } = useContext(SidebarContext);

  const rawOptions =
    !error && !loading && data?.length > 0 ? data : mockLanguages;
  const filteredOptions = rawOptions.filter((option) =>
    SUPPORTED_LANGUAGES.includes(option.iso_code)
  );
  const languageOptions =
    filteredOptions.length > 0 ? filteredOptions : mockLanguages;

  return (
    <select
      name="language"
      {...register("language", {
        required: "language is required!",
      })}
      onChange={(e) => handleSelectLanguage(e.target.value)}
      className="block w-20 h-10 border border-emerald-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm dark:text-gray-300 focus:outline-none rounded-md form-select focus:bg-white dark:focus:bg-gray-700"
    >
      <option value={lang} defaultChecked hidden>
        {lang}
      </option>
      {languageOptions.map((language) => (
        <option key={language._id || language.iso_code} value={language.iso_code}>
          {language.iso_code}
        </option>
      ))}
    </select>
  );
};

export default SelectLanguageTwo;
