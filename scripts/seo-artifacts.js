/**
 * Pure builders for the crawler-facing build artifacts (robots.txt, sitemap.xml
 * and the noindex tag). No filesystem or environment access lives here -- that
 * is copy-seo.js's job -- which keeps every rule below directly testable.
 */

/**
 * Pulls the route paths out of the `pageRoute` object literal in routes.ts.
 *
 * Deliberately narrow: it reads only that block, so the ~30 API endpoint
 * constants exported from the same file cannot leak into the sitemap.
 */
function parseRoutePaths(routesSource) {
    const block = routesSource.match(
        /export const pageRoute\s*=\s*\{([\s\S]*?)\}\s*;/
    );
    if (!block) {
        throw new Error(
            "seo-artifacts: could not find the 'pageRoute' object in routes.ts. " +
                "The sitemap generator depends on it; update the parser if the shape changed."
        );
    }
    return [...block[1].matchAll(/:\s*"([^"]+)"/g)].map((match) => match[1]);
}

/** The locales the CMS publishes. Mirrors `languages` in src/i18n.ts. */
const LANGUAGES = ["de", "en"];

const xmlEscape = (value) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

const urlFor = (baseUrl, routePath, language) =>
    language
        ? `${baseUrl}${routePath}?lang=${language}`
        : `${baseUrl}${routePath}`;

/**
 * Every route in every language. Each entry declares the full set of language
 * alternates so search engines treat them as translations of one another rather
 * than as competing duplicates.
 */
function buildSitemap(baseUrl, routePaths) {
    const entries = routePaths.flatMap((routePath) => {
        const alternates = [
            ...LANGUAGES.map(
                (alternate) =>
                    `        <xhtml:link rel="alternate" hreflang="${alternate}" href="${xmlEscape(
                        urlFor(baseUrl, routePath, alternate)
                    )}" />`
            ),
            `        <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(
                urlFor(baseUrl, routePath, null)
            )}" />`,
        ].join("\n");

        return LANGUAGES.map((language) =>
            [
                "    <url>",
                `        <loc>${xmlEscape(
                    urlFor(baseUrl, routePath, language)
                )}</loc>`,
                alternates,
                "    </url>",
            ].join("\n")
        );
    });

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
        entries.join("\n"),
        "</urlset>",
        "",
    ].join("\n");
}

const ENVIRONMENTS = {
    production: { baseUrl: "https://zoonotify.bfr.berlin", indexable: true },
    qa: { baseUrl: "https://zoonotify-dev.bfr.berlin", indexable: false },
    development: { baseUrl: "http://localhost:8080", indexable: false },
};

/**
 * Only an explicit "production" is indexable. Anything unrecognised -- an unset
 * NODE_ENV, a typo, a new environment nobody wired up here -- falls back to the
 * non-indexable development profile, so the failure mode is "not indexed"
 * rather than "staging competing with production in search results".
 */
function resolveEnvironment(nodeEnv) {
    const name = Object.prototype.hasOwnProperty.call(ENVIRONMENTS, nodeEnv)
        ? nodeEnv
        : "development";
    return { name, ...ENVIRONMENTS[name] };
}

const NOINDEX_TAG = '<meta name="robots" content="noindex, nofollow" />';

/**
 * Belt and braces alongside robots.txt: a Disallow rule stops a well-behaved
 * crawler from fetching the page, but only a noindex tag keeps an already-known
 * QA URL out of the index.
 *
 * Anchored on <title> because that is the one element index.html is guaranteed
 * to have. Returns the markup untouched when there is nothing to anchor to, so
 * a malformed document fails the build's expectations rather than silently
 * producing corrupt HTML.
 */
function withNoindex(html) {
    if (html.includes('name="robots"')) return html;
    return html.replace(/([ \t]*)<title>/, `$1${NOINDEX_TAG}\n$1<title>`);
}

module.exports = {
    buildSitemap,
    parseRoutePaths,
    resolveEnvironment,
    withNoindex,
};
