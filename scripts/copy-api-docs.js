/**
 * Assembles the static API reference page in public/assets/api-docs/:
 *
 *   index.html           - copied by cp:html (this script checks it is there)
 *   api-docs.js          - the Swagger UI initializer, and
 *   openapi.json         - the spec synced from zoonotify-cms, both from
 *                          src/assets/api-docs/
 *   swagger-ui-*.{js,css} - straight from node_modules/swagger-ui-dist
 *
 * Nothing from swagger-ui-dist is committed, and the page sits outside the
 * webpack bundle, so the SPA's size and the deploy workflows are unaffected.
 */
const fs = require("fs");
const path = require("path");
const { SWAGGER_UI_FILES } = require("./api-docs");

const ROOT = path.resolve(__dirname, "..");
const SOURCE_DIR = path.join(ROOT, "src", "assets", "api-docs");
const TARGET_DIR = path.join(ROOT, "public", "assets", "api-docs");
const SWAGGER_DIR = path.dirname(
    require.resolve("swagger-ui-dist/package.json")
);

function main() {
    if (!fs.existsSync(path.join(TARGET_DIR, "index.html"))) {
        throw new Error(
            `${path.join(
                TARGET_DIR,
                "index.html"
            )} not found. This script must run after 'cp:html'.`
        );
    }
    const sources = fs
        .readdirSync(SOURCE_DIR)
        .filter((file) => file !== "index.html")
        .map((file) => path.join(SOURCE_DIR, file));
    const vendor = SWAGGER_UI_FILES.map((file) => path.join(SWAGGER_DIR, file));

    for (const file of [...sources, ...vendor]) {
        fs.copyFileSync(file, path.join(TARGET_DIR, path.basename(file)));
    }
    console.log(
        `copy-api-docs: ${sources.length + vendor.length} files -> ` +
            path.relative(ROOT, TARGET_DIR)
    );
}

main();
