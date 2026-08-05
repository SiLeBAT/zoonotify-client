/**
 * Emits the crawler-facing files that are not part of the webpack bundle:
 *
 *   public/robots.txt    - environment-specific; QA/dev must never be indexed
 *   public/sitemap.xml   - every route x every language, with hreflang alternates
 *
 * Runs last in `cp:all`, after `cp:html`, because it post-processes the copied
 * public/index.html to add a noindex tag on non-production builds.
 *
 * This file is the I/O shell only. Every rule it applies lives in
 * seo-artifacts.js, which is pure and unit-tested.
 */
const fs = require("fs");
const path = require("path");
const {
    buildSitemap,
    parseRoutePaths,
    resolveEnvironment,
    withNoindex,
} = require("./seo-artifacts");

const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const INDEX_HTML = path.join(PUBLIC_DIR, "index.html");
const ROUTES_FILE = path.join(
    ROOT,
    "src",
    "app",
    "shared",
    "infrastructure",
    "router",
    "routes.ts"
);

function main() {
    // `ci` makes an unnamed environment fatal rather than a silent fallback to
    // the non-indexable development profile. See resolveEnvironment.
    const environment = resolveEnvironment(process.env.NODE_ENV, {
        ci: Boolean(process.env.CI),
    });
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });

    fs.copyFileSync(
        path.join(
            ROOT,
            "src",
            "seo",
            environment.indexable ? "robots.prod.txt" : "robots.qa.txt"
        ),
        path.join(PUBLIC_DIR, "robots.txt")
    );

    const routePaths = parseRoutePaths(fs.readFileSync(ROUTES_FILE, "utf8"));
    fs.writeFileSync(
        path.join(PUBLIC_DIR, "sitemap.xml"),
        buildSitemap(environment.baseUrl, routePaths)
    );

    let noindexed = false;
    if (!environment.indexable) {
        if (!fs.existsSync(INDEX_HTML)) {
            throw new Error(
                `copy-seo: ${INDEX_HTML} not found. This script must run after 'cp:html'.`
            );
        }
        const original = fs.readFileSync(INDEX_HTML, "utf8");
        const updated = withNoindex(original);
        if (updated === original && !original.includes('name="robots"')) {
            throw new Error(
                "copy-seo: could not anchor the noindex tag - no <title> in index.html. " +
                    "Refusing to ship a non-production build without it."
            );
        }
        fs.writeFileSync(INDEX_HTML, updated);
        noindexed = true;
    }

    console.log(
        `copy-seo: env=${environment.name} indexable=${environment.indexable} ` +
            `routes=${routePaths.length} urls=${routePaths.length * 2}` +
            (noindexed ? " noindex=applied" : "")
    );
}

main();
