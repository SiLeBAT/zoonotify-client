const fs = require("fs");
const path = require("path");
const {
    buildSitemap,
    parseRoutePaths,
    resolveEnvironment,
    withNoindex,
} = require("../seo-artifacts");

const locsIn = (xml) =>
    [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

const alternatesFor = (xml, loc) => {
    const entry = xml
        .split("<url>")
        .find((chunk) => chunk.includes(`<loc>${loc}</loc>`));
    return [...entry.matchAll(/hreflang="([^"]+)"\s+href="([^"]+)"/g)].map(
        ([, hreflang, href]) => ({ hreflang, href })
    );
};

/**
 * Deliberately reads the real routes file rather than a fixture: the whole point
 * of parseRoutePaths is that it stays in step with the app's actual routing
 * table, so a fixture would test the fixture.
 */
const ROUTES_SOURCE = fs.readFileSync(
    path.resolve(
        __dirname,
        "../../src/app/shared/infrastructure/router/routes.ts"
    ),
    "utf8"
);

describe("parseRoutePaths", () => {
    it("returns every route the app declares in pageRoute", () => {
        expect(parseRoutePaths(ROUTES_SOURCE)).toEqual([
            "/",
            "/links",
            "/explanations",
            "/evaluations",
            "/dataProtectionDeclaration",
            "/prevalence",
            "/antimicrobial",
            "/antibiotic-resistance",
            "/microbial-counts",
        ]);
    });

    it("ignores quoted strings declared outside the pageRoute block", () => {
        const source = [
            'export const SOMETHING_ELSE = "/not-a-route";',
            "export const pageRoute = {",
            '    homePagePath: "/",',
            "};",
            'export const ALSO_NOT = "/nope";',
        ].join("\n");

        expect(parseRoutePaths(source)).toEqual(["/"]);
    });

    it("throws rather than emitting an empty sitemap when pageRoute is gone", () => {
        const source = 'export const routes = { homePagePath: "/" };';

        expect(() => parseRoutePaths(source)).toThrow(/pageRoute/);
    });
});

describe("buildSitemap", () => {
    it("lists every route in every language, tagged with ?lang=", () => {
        const xml = buildSitemap("https://example.test", ["/", "/prevalence"]);

        expect(locsIn(xml)).toEqual([
            "https://example.test/?lang=de",
            "https://example.test/?lang=en",
            "https://example.test/prevalence?lang=de",
            "https://example.test/prevalence?lang=en",
        ]);
    });

    it("cross-links each entry to its translations and an x-default", () => {
        const xml = buildSitemap("https://example.test", ["/prevalence"]);

        expect(
            alternatesFor(xml, "https://example.test/prevalence?lang=de")
        ).toEqual([
            { hreflang: "de", href: "https://example.test/prevalence?lang=de" },
            { hreflang: "en", href: "https://example.test/prevalence?lang=en" },
            {
                hreflang: "x-default",
                href: "https://example.test/prevalence",
            },
        ]);
    });
});

describe("resolveEnvironment", () => {
    it("lets production be indexed", () => {
        expect(resolveEnvironment("production")).toMatchObject({
            baseUrl: "https://zoonotify.bfr.berlin",
            indexable: true,
        });
    });

    it.each(["qa", "development", undefined, "anything-else"])(
        "keeps %s out of the index so it cannot compete with production",
        (nodeEnv) => {
            expect(resolveEnvironment(nodeEnv).indexable).toBe(false);
        }
    );

    it("refuses to guess in CI, rather than silently shipping a noindex build to production", () => {
        expect(() => resolveEnvironment(undefined, { ci: true })).toThrow(
            /NODE_ENV/
        );
    });

    it("still falls back to development outside CI, so a local build needs no ceremony", () => {
        expect(resolveEnvironment(undefined)).toMatchObject({
            name: "development",
            indexable: false,
        });
    });

    it("advertises the public host in the production sitemap, never a local one", () => {
        const { baseUrl } = resolveEnvironment("production");
        const xml = buildSitemap(baseUrl, parseRoutePaths(ROUTES_SOURCE));

        expect(locsIn(xml)).toHaveLength(18);
        locsIn(xml).forEach((loc) => {
            expect(loc).toMatch(/^https:\/\/zoonotify\.bfr\.berlin\//);
        });
        expect(xml).not.toMatch(/localhost/);
    });
});

describe("withNoindex", () => {
    const html =
        "<html>\n<head>\n    <title>ZooNotify</title>\n</head>\n</html>";

    it("adds a robots noindex tag to the document head", () => {
        expect(withNoindex(html)).toContain(
            '<meta name="robots" content="noindex, nofollow" />'
        );
    });

    it("keeps the existing head intact", () => {
        expect(withNoindex(html)).toContain("<title>ZooNotify</title>");
    });

    it("is idempotent, so re-running the build cannot stack duplicate tags", () => {
        const once = withNoindex(html);

        expect(withNoindex(once)).toBe(once);
    });

    it("leaves markup alone when there is no head to anchor to", () => {
        const headless = "<html><body>nothing here</body></html>";

        expect(withNoindex(headless)).toBe(headless);
    });
});
