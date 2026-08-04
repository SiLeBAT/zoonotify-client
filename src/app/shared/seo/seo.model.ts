import { pageRoute } from "../infrastructure/router/routes";

/** The locales the CMS publishes. Mirrors `languages` in src/i18n.ts. */
export const SEO_LANGUAGES = ["de", "en"] as const;
export type SeoLanguage = (typeof SEO_LANGUAGES)[number];

const baseLanguage = (value: string | undefined | null): string =>
    (value || "").split("-")[0].toLowerCase();

/**
 * Whether we publish this language at all. Kept separate from
 * `normalizeLanguage` because the two answer different questions: callers
 * acting on a URL-supplied value need to know it is real BEFORE collapsing it,
 * otherwise "?lang=fr" reads as a request for the fallback and silently drags
 * an English reader into German.
 */
export function isSupportedLanguage(value: string | undefined | null): boolean {
    return (SEO_LANGUAGES as readonly string[]).includes(baseLanguage(value));
}

/**
 * i18next hands back tags like "de-DE"; our URLs and the `lang` attribute only
 * ever carry the bare language. Anything unrecognised falls back to the same
 * default as i18n's fallbackLng.
 */
export function normalizeLanguage(
    value: string | undefined | null
): SeoLanguage {
    const base = baseLanguage(value);
    return isSupportedLanguage(base) ? (base as SeoLanguage) : "de";
}

export type SeoRoute = {
    /** Route path as declared in `pageRoute`. */
    readonly path: string;
    /** Key in the Seo i18n namespace: `<key>.title` and `<key>.description`. */
    readonly key: string;
};

/**
 * Route -> metadata. Every entry in `pageRoute` must appear here; the test
 * suite iterates the routing table and fails if any route resolves no copy.
 */
export const SEO_ROUTES: readonly SeoRoute[] = [
    { path: pageRoute.homePagePath, key: "home" },
    { path: pageRoute.linkPagePath, key: "links" },
    { path: pageRoute.infoPagePath, key: "explanations" },
    { path: pageRoute.evaluationsPagePath, key: "evaluations" },
    { path: pageRoute.dpdPagePath, key: "dataProtection" },
    { path: pageRoute.prevalencePagePath, key: "prevalence" },
    { path: pageRoute.antimicrobialPagePath, key: "antimicrobial" },
    {
        path: pageRoute.antibioticResistancePagePath,
        key: "antibioticResistance",
    },
    { path: pageRoute.microbialCountsPagePath, key: "microbialCounts" },
];

/**
 * Resolves a pathname to its SEO entry, or null for an unknown path.
 *
 * The home route is matched exactly: as "/" it is a prefix of every other
 * route, so a prefix match would claim them all.
 */
export function matchSeoRoute(pathname: string): SeoRoute | null {
    const normalized =
        pathname.length > 1 && pathname.endsWith("/")
            ? pathname.slice(0, -1)
            : pathname;

    if (normalized === pageRoute.homePagePath) {
        return (
            SEO_ROUTES.find((route) => route.path === pageRoute.homePagePath) ??
            null
        );
    }

    return (
        SEO_ROUTES.find(
            (route) =>
                route.path !== pageRoute.homePagePath &&
                normalized.startsWith(route.path)
        ) ?? null
    );
}
