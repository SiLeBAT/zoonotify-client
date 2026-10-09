/**
 * Pure rules behind the API reference page at /assets/api-docs/. The I/O
 * shells are sync-api-docs.js (pulls the spec from zoonotify-cms) and
 * copy-api-docs.js (assembles the page in public/).
 *
 * The spec itself is generated and committed in zoonotify-cms
 * (api-reference/openapi.json); this repo only carries a synced copy.
 */

const CMS_RAW_BASE = "https://raw.githubusercontent.com/SiLeBAT/zoonotify-cms";
const CMS_SPEC_PATH = "api-reference/openapi.json";

/**
 * Swagger UI files copied from swagger-ui-dist. The standalone preset is left
 * out on purpose: it only adds Swagger's own top bar, whose URL box would let
 * the page load arbitrary specs. The page has its own "← ZooNotify" bar.
 */
const SWAGGER_UI_FILES = ["swagger-ui-bundle.js", "swagger-ui.css"];

/** Branch, tag or commit names as git allows them, minus anything URL-unsafe. */
const GIT_REF = /^(?!.*\.\.)[A-Za-z0-9][A-Za-z0-9._/-]*$/;

function rawSpecUrl(ref) {
    if (typeof ref !== "string" || !GIT_REF.test(ref)) {
        throw new Error(
            `Expected a zoonotify-cms git ref (branch, tag or commit), got ${JSON.stringify(
                ref
            )}`
        );
    }
    return `${CMS_RAW_BASE}/${ref}/${CMS_SPEC_PATH}`;
}

/** Parses and sanity-checks a fetched spec, so an error page never gets committed. */
function parseSpec(text) {
    let spec;
    try {
        spec = JSON.parse(text);
    } catch {
        throw new Error("The fetched API reference is not JSON");
    }
    if (typeof spec.openapi !== "string" || !spec.openapi.startsWith("3.")) {
        throw new Error(
            "The fetched API reference is not an OpenAPI 3 document"
        );
    }
    if (!spec.paths || typeof spec.paths !== "object") {
        throw new Error("The fetched API reference has no paths");
    }
    return spec;
}

module.exports = { parseSpec, rawSpecUrl, SWAGGER_UI_FILES };
