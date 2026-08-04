import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import {
    matchSeoRoute,
    normalizeLanguage,
    SEO_LANGUAGES,
    SeoLanguage,
    SeoRoute,
} from "./seo.model";

/**
 * Marks elements this hook added, distinguishing them from the static baseline
 * in src/index.html when inspecting the head. Tags the static markup already
 * carries are updated in place rather than duplicated.
 */
const MANAGED_ATTR = "data-seo-managed";

const OG_LOCALE: Record<SeoLanguage, string> = { de: "de_DE", en: "en_GB" };

/** The publishing institute, reused across every structured-data node. */
const BFR = {
    "@type": "GovernmentOrganization",
    name: "Bundesinstitut für Risikobewertung",
    alternateName: "German Federal Institute for Risk Assessment",
    url: "https://www.bfr.bund.de/",
} as const;

function upsert<E extends HTMLElement>(selector: string, create: () => E): E {
    const existing = document.head.querySelector<E>(selector);
    if (existing) return existing;
    const element = create();
    element.setAttribute(MANAGED_ATTR, "true");
    document.head.appendChild(element);
    return element;
}

function setMeta(
    keyAttr: "name" | "property",
    key: string,
    content: string
): void {
    const element = upsert<HTMLMetaElement>(`meta[${keyAttr}="${key}"]`, () => {
        const meta = document.createElement("meta");
        meta.setAttribute(keyAttr, key);
        return meta;
    });
    element.setAttribute("content", content);
}

function setLink(rel: string, href: string, hreflang?: string): void {
    const selector = hreflang
        ? `link[rel="${rel}"][hreflang="${hreflang}"]`
        : `link[rel="${rel}"]`;
    const element = upsert<HTMLLinkElement>(selector, () => {
        const link = document.createElement("link");
        link.setAttribute("rel", rel);
        if (hreflang) link.setAttribute("hreflang", hreflang);
        return link;
    });
    element.setAttribute("href", href);
}

/**
 * Canonical deliberately carries ONLY the language parameter. The data pages
 * push filter state (microorganism, view, s, ...) into the query string, and
 * folding that in would mint a fresh canonical URL for every filter combination
 * a crawler stumbles across.
 */
function canonicalUrl(pathname: string, language: SeoLanguage): string {
    return `${window.location.origin}${pathname}?lang=${language}`;
}

/**
 * One node per page, picked by what the page actually is: the site itself on
 * the home route, a Dataset where the page publishes data, and a plain WebPage
 * for prose. Emitting Dataset everywhere would misdescribe the glossary and the
 * privacy policy as data products.
 */
function buildJsonLd(
    route: SeoRoute,
    language: SeoLanguage,
    pathname: string,
    title: string,
    description: string,
    datasetName: string | null
): Record<string, unknown> {
    const origin = window.location.origin;

    if (route.key === "home") {
        return {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "ZooNotify",
            description,
            url: `${origin}/`,
            inLanguage: [...SEO_LANGUAGES],
            publisher: BFR,
        };
    }

    if (route.dataset && datasetName) {
        return {
            "@context": "https://schema.org",
            "@type": "Dataset",
            name: datasetName,
            description,
            url: canonicalUrl(pathname, language),
            inLanguage: language,
            isAccessibleForFree: true,
            creator: BFR,
            publisher: BFR,
            spatialCoverage: { "@type": "Place", name: "Deutschland" },
            // `license` and `temporalCoverage` are deliberately absent. Both are
            // factual claims about BfR's published data that this codebase
            // cannot derive, and wrong structured data is worse than incomplete
            // structured data. Add them once BfR confirms the licence terms and
            // the earliest reporting year.
        };
    }

    return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        description,
        url: canonicalUrl(pathname, language),
        inLanguage: language,
        isPartOf: { "@type": "WebSite", name: "ZooNotify", url: `${origin}/` },
        publisher: BFR,
    };
}

const JSON_LD_ID = "seo-json-ld";

function setJsonLd(payload: Record<string, unknown>): void {
    const script = upsert<HTMLScriptElement>(`script#${JSON_LD_ID}`, () => {
        const element = document.createElement("script");
        element.id = JSON_LD_ID;
        element.type = "application/ld+json";
        return element;
    });
    script.textContent = JSON.stringify(payload);
}

/**
 * Keeps the document head in step with the active route and language.
 *
 * Mounted once inside the router rather than per page, so every route gets
 * metadata and the rules live in one place.
 */
export function useSeo(): void {
    const { t, i18n } = useTranslation(["Seo"]);
    const { pathname } = useLocation();

    useEffect(() => {
        const language = normalizeLanguage(i18n.language);
        document.documentElement.lang = language;

        const route = matchSeoRoute(pathname);

        // Unknown path -> the 404 page. Keep it out of the index entirely, but
        // still let crawlers follow the navigation away from it.
        if (!route) {
            setMeta("name", "robots", "noindex, follow");
            document.title = `${t("notFound.title")} — ZooNotify`;
            setMeta("name", "description", t("notFound.description"));
            return;
        }
        setMeta("name", "robots", "index, follow");

        const title = t(`${route.key}.title`);
        // The home title already names the site; suffixing it would stutter.
        document.title = route.key === "home" ? title : `${title} — ZooNotify`;
        setMeta("name", "description", t(`${route.key}.description`));
        setLink("canonical", canonicalUrl(pathname, language));
        SEO_LANGUAGES.forEach((alternate) => {
            setLink("alternate", canonicalUrl(pathname, alternate), alternate);
        });
        setLink(
            "alternate",
            `${window.location.origin}${pathname}`,
            "x-default"
        );

        // Social and LLM crawlers read these rather than the title/description
        // pair, so they have to track the route too.
        setMeta("property", "og:title", document.title);
        setMeta("property", "og:description", t(`${route.key}.description`));
        setMeta("property", "og:url", canonicalUrl(pathname, language));
        setMeta("property", "og:locale", OG_LOCALE[language]);
        setMeta("name", "twitter:title", document.title);
        setMeta("name", "twitter:description", t(`${route.key}.description`));

        setJsonLd(
            buildJsonLd(
                route,
                language,
                pathname,
                document.title,
                t(`${route.key}.description`),
                route.dataset ? t(route.dataset.nameKey) : null
            )
        );
    }, [pathname, i18n.language, t]);
}
