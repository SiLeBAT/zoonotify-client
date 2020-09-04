import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-xhr-backend";

const languages = ["de", "en"];

i18n.use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        ns: ['DataProtection', 'Footer', 'Header', 'HomePage', 'QueryPage'],
        debug: true,
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
export default i18n;
