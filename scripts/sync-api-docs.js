/**
 * Pulls the generated Public Data API spec from zoonotify-cms into
 * src/assets/api-docs/openapi.json:
 *
 *   npm run sync:api-docs -- <cms-git-ref>     (branch, tag or commit)
 *
 * The file is written byte-for-byte as the CMS committed it, so CI can diff
 * it against the CMS copy. Every rule lives in api-docs.js, which is pure and
 * unit-tested.
 */
const fs = require("fs");
const path = require("path");
const { parseSpec, rawSpecUrl } = require("./api-docs");

const TARGET = path.resolve(
    __dirname,
    "..",
    "src",
    "assets",
    "api-docs",
    "openapi.json"
);

async function main(ref) {
    const url = rawSpecUrl(ref);
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`GET ${url} answered ${res.status}`);
    }
    const text = await res.text();
    const spec = parseSpec(text);

    fs.writeFileSync(TARGET, text);
    console.log(
        `sync-api-docs: ${ref} -> ${path.relative(process.cwd(), TARGET)} ` +
            `(API version ${spec.info && spec.info.version}, ${
                Object.keys(spec.paths).length
            } paths)`
    );
}

main(process.argv[2]).catch((err) => {
    console.error(`sync-api-docs: ${err.message}`);
    process.exitCode = 1;
});
