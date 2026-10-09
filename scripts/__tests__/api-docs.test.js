const fs = require("fs");
const path = require("path");
const { parseSpec, rawSpecUrl, SWAGGER_UI_FILES } = require("../api-docs");

const ROOT = path.resolve(__dirname, "../..");
const read = (...segments) =>
    fs.readFileSync(path.join(ROOT, ...segments), "utf8");

describe("rawSpecUrl", () => {
    it.each(["develop", "zn1858", "feature/api-docs", "v4.4.1", "ee5d4b8"])(
        "points at the CMS repo's committed spec for %s",
        (ref) => {
            expect(rawSpecUrl(ref)).toBe(
                `https://raw.githubusercontent.com/SiLeBAT/zoonotify-cms/${ref}/api-reference/openapi.json`
            );
        }
    );

    it.each([undefined, "", " ", "../main", "a b", "x?y"])(
        "rejects %p",
        (ref) => {
            expect(() => rawSpecUrl(ref)).toThrow(/git ref/);
        }
    );
});

describe("parseSpec", () => {
    const spec = { openapi: "3.0.3", info: {}, paths: { "/x": {} } };

    it("accepts an OpenAPI 3 document and returns it", () => {
        expect(parseSpec(JSON.stringify(spec))).toEqual(spec);
    });

    it.each([
        ["not JSON", "404: Not Found"],
        ["not OpenAPI 3", JSON.stringify({ swagger: "2.0", paths: {} })],
        ["without paths", JSON.stringify({ openapi: "3.0.3" })],
    ])("rejects a body that is %s", (_, body) => {
        expect(() => parseSpec(body)).toThrow();
    });
});

describe("API reference page wiring", () => {
    const pkg = JSON.parse(read("package.json"));
    const page = read("src", "assets", "api-docs", "index.html");

    it("copies the page into public/ as part of cp:all", () => {
        expect(pkg.scripts["cp:all"]).toMatch(/npm run cp:api-docs/);
        expect(pkg.scripts["cp:all"].indexOf("cp:html")).toBeLessThan(
            pkg.scripts["cp:all"].indexOf("cp:api-docs")
        );
    });

    it("serves the page for the bare directory URL on Apache", () => {
        const htaccess = read("src", "assets", "api-docs", ".htaccess");
        expect(htaccess).toMatch(/^RewriteEngine On$/m);
        expect(htaccess).toMatch(/^RewriteRule \^\$ index\.html \[L\]$/m);
    });

    it("pins swagger-ui-dist to an exact 5.x version", () => {
        expect(pkg.devDependencies["swagger-ui-dist"]).toMatch(/^5\.\d+\.\d+$/);
    });

    it("loads Swagger UI from files beside the page, with no inline script", () => {
        for (const file of SWAGGER_UI_FILES)
            expect(page).toContain(`./${file}`);
        expect(page).not.toMatch(/<script(?![^>]*\bsrc=)[^>]*>/);
        expect(page).toMatch(/<a [^>]*href="\/"/);
    });

    it("ships the synced spec next to the page", () => {
        expect(() =>
            parseSpec(read("src", "assets", "api-docs", "openapi.json"))
        ).not.toThrow();
    });

    it("keeps Swagger UI out of the SPA bundle", () => {
        const offenders = [];
        const walk = (dir) => {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                const full = path.join(dir, entry.name);
                if (entry.isDirectory()) walk(full);
                else if (
                    /\.(tsx?|jsx?)$/.test(entry.name) &&
                    /from ["']swagger-ui|require\(["']swagger-ui/.test(
                        fs.readFileSync(full, "utf8")
                    )
                ) {
                    offenders.push(full);
                }
            }
        };
        walk(path.join(ROOT, "src", "app"));

        expect(offenders).toEqual([]);
    });

    it("links the API reference as a same-origin page", () => {
        expect(
            read(
                "src",
                "app",
                "shared",
                "infrastructure",
                "router",
                "routes.ts"
            )
        ).toMatch(
            /export const API_DOCUMENTATION_URL = "\/assets\/api-docs\/index\.html";/
        );
    });
});
