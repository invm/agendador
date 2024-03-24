import en from "./en.json";
import he from "./he.json";
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18next.use(LanguageDetector).init({
  resources: { en, he },
  fallbackLng: "en",
  preload: ["en", "he"],
  debug: import.meta.env.DEV,
  interpolation: {
    escapeValue: false,
  },
});

const t = i18next.t.bind(i18next);

export { t };
