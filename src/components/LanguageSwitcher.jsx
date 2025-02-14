import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng); // Save preference
  };

  return (
    <select
      onChange={(e) => changeLanguage(e.target.value)}
      value={i18n.language}
      className="border border-gray-300 px-3 py-0 rounded-md bg-black "
    >
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
    </select>
  );
}
