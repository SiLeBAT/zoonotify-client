import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";

const languages = ["de", "en"];

i18n.use(HttpApi)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        ns: [
            "DataProtection",
            "Footer",
            "Header",
            "HomePage",
            "QueryPage",
            "Seo",
        ],
        debug: false,
        detection: {
            // querystring first: someone arriving from a search result or a
            // shared link must get that link's language on the FIRST render.
            // With localStorage alone the app booted in the stored language and
            // only corrected itself once a page effect ran, so a crawler could
            // capture the wrong language entirely. Only `lang` is resolved here
            // (the detector takes a single parameter name); legacy `?locale=`
            // links are picked up a moment later by useLanguageUrlSync.
            order: ["querystring", "localStorage"],
            lookupQuerystring: "lang",
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
