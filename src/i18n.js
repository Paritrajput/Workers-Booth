import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import hi from "./locales/hi.json";


i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
  },
  lng: localStorage.getItem("language") || "en", // Load saved language
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});
const savedLanguage = localStorage.getItem("language") || "en";
i18n.use(initReactI18next).init({
  lng: savedLanguage,
});


export default i18n;
