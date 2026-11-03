import amrDe from "../../../src/locales/de/Antibiotic.json";
import amrEn from "../../../src/locales/en/Antibiotic.json";
import footerDe from "../../../src/locales/de/Footer.json";
import footerEn from "../../../src/locales/en/Footer.json";
import infoDe from "../../../src/locales/de/InfoPage.json";
import infoEn from "../../../src/locales/en/InfoPage.json";
import prevalenceDe from "../../../src/locales/de/PrevalencePage.json";
import prevalenceEn from "../../../src/locales/en/PrevalencePage.json";
import type { Locale } from "./oracle";

/** Both site languages, German first as the language switch lists them. */
export const LANGUAGES: readonly Locale[] = ["de", "en"];

/** The locale JSON the release checks read expected texts from, per language. */
export const LOCALES = {
    de: {
        amr: amrDe,
        footer: footerDe,
        information: infoDe,
        prevalence: prevalenceDe,
    },
    en: {
        amr: amrEn,
        footer: footerEn,
        information: infoEn,
        prevalence: prevalenceEn,
    },
} as const;
