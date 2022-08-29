import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";

const languages = ["de", "en"];

i18n.use(HttpApi)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        ns: ["DataProtection", "Footer", "Header", "HomePage", "QueryPage"],
        debug: false,
        detection: {
            order: ["localStorage"],
            lookupLocalStorage: "i18nextLng",
        },
        fallbackLng: "de",
        whitelist: languages,

        interpolation: {
            escapeValue: false,
        },
    });

// eslint-disable-next-line import/no-default-export
export { default } from "i18next";
