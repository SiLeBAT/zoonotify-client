/**
 * A build with REACT_APP_MICROBIAL_TYPING_VISIBLE=false (production) must not
 * let the page's SEO entry claim its path: the 404 that renders there has to
 * resolve no entry, so it gets the noindex treatment.
 *
 * The flag is read once at module load, so each test loads the module afresh
 * with the env var set. The header link and route use the same constant but
 * cannot be rendered under jest (the emotion pragma needs the automatic JSX
 * runtime), so they are covered by the unit tests of the flag itself.
 */
import type * as SeoModel from "../../../shared/seo/seo.model";

const FLAG = "REACT_APP_MICROBIAL_TYPING_VISIBLE";
const original = process.env[FLAG];

function loadSeoModelWithFlag(value: string | undefined): typeof SeoModel {
    if (value === undefined) delete process.env[FLAG];
    else process.env[FLAG] = value;
    let loaded: typeof SeoModel | undefined;
    jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        loaded = require("../../../shared/seo/seo.model");
    });
    return loaded as typeof SeoModel;
}

afterEach(() => {
    if (original === undefined) delete process.env[FLAG];
    else process.env[FLAG] = original;
});

describe("Microbial typing SEO entry behind REACT_APP_MICROBIAL_TYPING_VISIBLE", () => {
    it("is absent when the build hides the page", () => {
        const seo = loadSeoModelWithFlag("false");

        expect(seo.matchSeoRoute("/microbial-typing")).toBeNull();
        expect(seo.matchSeoRoute("/prevalence")?.key).toBe("prevalence");
    });

    it("is present when the flag is unset", () => {
        const seo = loadSeoModelWithFlag(undefined);

        expect(seo.matchSeoRoute("/microbial-typing")?.key).toBe(
            "microbialTyping"
        );
    });
});
