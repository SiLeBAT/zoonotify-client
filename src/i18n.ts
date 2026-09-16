import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";
import { LANG_PARAM, LEGACY_LANG_PARAM } from "./app/shared/seo/seo.model";

const languages = ["de", "en"];

/**
 * The built-in querystring detector resolves exactly one parameter name, and
 * ours is `lang`. Pre-unification links carry `locale`, which used to be
 * repaired after the fact by useLanguageUrlSync -- and that lost a race it
 * could not win: i18next's init is asynchronous, so the hook's early
 * changeLanguage was discarded when init settled on `fallbackLng`, and the
 * hook then wrote that fallback into the URL, destroying the `locale` value
 * before anything could read it again. A reader following an old bookmark got
 * German whatever the link said, unless their browser happened to have the
 * language cached already -- which is why it looked fine when tested by hand.
 *
 * Resolving the legacy name here puts it on exactly the same footing as
 * `lang`: decided before the first render, with no repair step to race.
 */
const languageDetector = new LanguageDetector();
languageDetector.addDetector({
    name: "legacyLocaleQuerystring",
    lookup: () =>
        new URLSearchParams(window.location.search).get(LEGACY_LANG_PARAM) ??
        undefined,
});

i18n.use(HttpApi)
    .use(languageDetector)
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
            // capture the wrong language entirely. The legacy `?locale=` name
            // is resolved here too, by the custom detector above -- an explicit
            // parameter of either spelling beats a cached preference, and the
            // canonical `lang` beats the legacy name when a URL carries both.
            order: ["querystring", "legacyLocaleQuerystring", "localStorage"],
            lookupQuerystring: LANG_PARAM,
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
