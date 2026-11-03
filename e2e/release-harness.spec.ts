import { expect, test } from "@playwright/test";
import {
    CHECK_ANNOTATION,
    PARAMS_ANNOTATION,
    releaseCheck,
} from "./release/support/annotations";
import {
    loadAnnotations,
    loadChecksList,
    parseChecksList,
    scanAnnotations,
    syncProblems,
} from "./release/support/checks-list";
import { classifyLink, devRuleViolations } from "./release/support/links";
import { assertNotTruncated, normalise } from "./release/support/oracle";
import { commitMatches, servedCommit } from "./release/support/rc-guard";
import { resolveTarget } from "./release/targets";
import LZString from "lz-string";
import {
    parseExampleQuery,
    rebaseToSite,
    textNamesOrganism,
    unresolvedFilters,
} from "./release/support/welcome-links";

/**
 * The release harness's own rules. They run in the ordinary CMS-free sweep
 * (the `release` project never exists there), so the harness cannot rot between
 * release runs. This file is also the CI home of the sync check.
 */

test.describe("releaseCheck", () => {
    test("annotates the check ID", () => {
        expect(releaseCheck("footer.links")).toEqual([
            { type: CHECK_ANNOTATION, description: "footer.links" },
        ]);
    });

    test("adds parameters as a second annotation", () => {
        expect(
            releaseCheck("amr.filter", { organism: "SALM", view: "substance" })
        ).toEqual([
            { type: CHECK_ANNOTATION, description: "amr.filter" },
            {
                type: PARAMS_ANNOTATION,
                description: "organism=SALM,view=substance",
            },
        ]);
    });
});

test.describe("the dev rule", () => {
    test("accepts the production host and non-host links", () => {
        expect(
            devRuleViolations([
                "https://zoonotify.bfr.berlin/links",
                "/assets/api-docs/index.html",
                "mailto:info@zoonotify-dev.bfr.berlin",
                "https://www.bfr.bund.de/en/home.html",
            ])
        ).toEqual([]);
    });

    test("rejects other bfr.berlin hosts, localhost and IP hosts", () => {
        const bad = [
            "https://zoonotify-dev.bfr.berlin/prevalence",
            "http://localhost:8080/",
            "http://10.0.0.5/x",
        ];
        expect(devRuleViolations(bad)).toEqual(bad);
    });
});

test.describe("the external link rule", () => {
    test("2xx and 3xx are ok", () => {
        expect(classifyLink({ status: 200 })).toBe("ok");
        expect(classifyLink({ status: 301 })).toBe("ok");
    });

    test("only 404, 410 and DNS failure fail", () => {
        expect(classifyLink({ status: 404 })).toBe("fail");
        expect(classifyLink({ status: 410 })).toBe("fail");
        expect(classifyLink({ error: "getaddrinfo ENOTFOUND x.example" })).toBe(
            "fail"
        );
    });

    test("anything else could not be verified", () => {
        expect(classifyLink({ status: 403 })).toBe("could-not-verify");
        expect(classifyLink({ status: 503 })).toBe("could-not-verify");
        expect(classifyLink({ error: "Timeout 20000ms exceeded" })).toBe(
            "could-not-verify"
        );
    });
});

test("names are compared whitespace-normalised", () => {
    expect(normalise("  E.  coli \n spp. ")).toBe("E. coli spp.");
});

test("the truncation guard fails past the page size", () => {
    assertNotTruncated(900, 900);
    expect(() => assertNotTruncated(901, 900)).toThrow();
});

test.describe("the RC guard", () => {
    test("reads the served commit from the footer text", () => {
        expect(
            servedCommit("server commit@abc1234 client commit@ABCDEF1")
        ).toBe("ABCDEF1");
        expect(servedCommit("client version@1.2.3")).toBeNull();
    });

    test("short and full hashes match by prefix", () => {
        expect(commitMatches("abcdef1234567890", "abcdef1")).toBe(true);
        expect(commitMatches("abcdef1", "abcdef1234567890")).toBe(true);
        expect(commitMatches("1111111", "abcdef1")).toBe(false);
        expect(commitMatches("abcdef1", null)).toBe(false);
    });
});

test.describe("targets", () => {
    test("qa links the API reference, prod does not", () => {
        expect(resolveTarget("qa").apiReferenceLinked).toBe(true);
        expect(resolveTarget("prod").apiReferenceLinked).toBe(false);
    });

    test("an unknown or missing target is an error", () => {
        expect(() => resolveTarget(undefined)).toThrow(/E2E_TARGET/);
        expect(() => resolveTarget("staging")).toThrow(/E2E_TARGET/);
        expect(() => resolveTarget("toString")).toThrow(/E2E_TARGET/);
    });
});

test.describe("the release checks list sync check", () => {
    const LIST = [
        "| ID | Check | Test |",
        "|---|---|---|",
        "| `a.one` | One | `e2e/release/a.spec.ts` |",
        "| `b.two` | Two | manual |",
        "| `c.three` | Three | pending #999 |",
    ].join("\n");

    test("parses the rows", () => {
        expect(parseChecksList(LIST)).toEqual([
            { id: "a.one", test: "e2e/release/a.spec.ts" },
            { id: "b.two", test: "manual" },
            { id: "c.three", test: "pending #999" },
        ]);
    });

    const annotated = (src: string, file = "e2e/release/a.spec.ts") =>
        scanAnnotations([[file, src]]);

    test("passes when list and annotations agree", () => {
        const found = annotated(
            `{ annotation: releaseCheck("a.one", {x: "1"}) }`
        );
        expect(syncProblems(parseChecksList(LIST), found)).toEqual([]);
    });

    test("fails on a deliberately missing annotation", () => {
        const problems = syncProblems(
            parseChecksList(LIST),
            annotated("// none")
        );
        expect(problems).toEqual([expect.stringContaining("a.one")]);
    });

    test("fails on an unknown ID", () => {
        const found = annotated(
            `releaseCheck("a.one"); releaseCheck("not.on.list")`
        );
        expect(syncProblems(parseChecksList(LIST), found)).toEqual([
            expect.stringContaining("not.on.list"),
        ]);
    });

    test("fails when the annotation sits in another file than the list names", () => {
        const found = annotated(
            `releaseCheck("a.one")`,
            "e2e/release/z.spec.ts"
        );
        expect(syncProblems(parseChecksList(LIST), found)).toEqual([
            expect.stringContaining("z.spec.ts"),
        ]);
    });

    test("fails when a pending row is already annotated", () => {
        const found = annotated(
            `releaseCheck("a.one"); releaseCheck("c.three")`
        );
        expect(syncProblems(parseChecksList(LIST), found)).toEqual([
            expect.stringContaining("c.three"),
        ]);
    });

    test("the real list and the real annotations agree", () => {
        expect(syncProblems(loadChecksList(), loadAnnotations())).toEqual([]);
    });
});

test.describe("welcome example queries", () => {
    const OPTIONS = {
        microorganism: [{ name: "Salmonella spp.", documentId: "mic1" }],
        superCategorySampleOrigin: [{ name: "Pig", documentId: "sup1" }],
        matrixGroup: [{ name: "Meat and meat products", documentId: "mg1" }],
    };

    test("reads the filters of a prevalence link, repeated keys included", () => {
        const query = parseExampleQuery(
            "https://zoonotify.bfr.berlin/prevalence?microorganism=Salmonella+spp.&matrixGroup=A+%28x%29&matrixGroup=B&lang=en&chartMicro=Salmonella+spp.",
            "de"
        );
        expect(query).toEqual({
            kind: "prevalence",
            lang: "en",
            organism: "Salmonella spp.",
            filters: [
                { key: "microorganism", value: "Salmonella spp." },
                { key: "matrixGroup", value: "A (x)" },
                { key: "matrixGroup", value: "B" },
                { key: "chartMicro", value: "Salmonella spp." },
            ],
        });
    });

    test("reads the comma separated filters of a trend link", () => {
        const query = parseExampleQuery(
            "https://zoonotify.bfr.berlin/antibiotic-resistance?view=trend&lang=de&microorganism=E.+coli&matrix=Fresh+meat&antimicrobialSubstance=AMP%2CCIP",
            "en"
        );
        expect(query).toEqual({
            kind: "amr",
            lang: "de",
            organism: "E. coli",
            filters: [
                { key: "matrix", value: "Fresh meat" },
                { key: "antimicrobialSubstance", value: "AMP" },
                { key: "antimicrobialSubstance", value: "CIP" },
            ],
        });
    });

    test("decodes the compressed state of a substance link", () => {
        const s = LZString.compressToEncodedURIComponent(
            JSON.stringify({
                m: "E. coli",
                v: "substance",
                l: "de",
                f: { y: ["2024"], u: ["sup1"], mG: ["Fleisch"] },
            })
        );
        expect(
            parseExampleQuery(
                `https://zoonotify.bfr.berlin/antibiotic-resistance?s=${s}`,
                "en"
            )
        ).toEqual({
            kind: "amr",
            lang: "de",
            organism: "E. coli",
            filters: [
                { key: "superCategorySampleOrigin", value: "sup1" },
                { key: "matrixGroup", value: "Fleisch" },
            ],
        });
    });

    test("ignores other links", () => {
        for (const href of [
            "https://zoonotify.bfr.berlin/evaluations?division=MULTIPLE",
            "https://www.bfr.bund.de/en/",
            "https://zoonotify.bfr.berlin/antibiotic-resistance?s=garbage",
            "not a url",
        ]) {
            expect(parseExampleQuery(href, "en")).toBeNull();
        }
    });

    test("resolves values by name or documentId and reports the rest", () => {
        const filters = [
            { key: "microorganism", value: "Salmonella spp." },
            { key: "superCategorySampleOrigin", value: "sup1" },
            {
                key: "superCategorySampleOrigin",
                value: "Pig (animal/food samples)",
            },
            { key: "matrixGroup", value: "gone" },
            { key: "chartMicro", value: "Salmonella spp." },
            { key: "chartMicro", value: "mic1" },
        ];
        expect(unresolvedFilters(filters, OPTIONS)).toEqual([
            {
                key: "superCategorySampleOrigin",
                value: "Pig (animal/food samples)",
            },
            { key: "matrixGroup", value: "gone" },
            { key: "chartMicro", value: "mic1" },
        ]);
    });

    test("link text names the organism by name, abbreviation or first word", () => {
        expect(
            textNamesOrganism(
                "Prevalence of Salmonella spp. in feed",
                "Salmonella spp."
            )
        ).toBe(true);
        expect(
            textNamesOrganism(
                "MRSA in samples from cows",
                "Methicillin-resistant Staphylococcus aureus (MRSA)"
            )
        ).toBe(true);
        expect(
            textNamesOrganism(
                "ESBL producing Escherichia coli",
                "ESBL/AmpC E. coli"
            )
        ).toBe(true);
        expect(textNamesOrganism("commensal E. coli", "E. coli")).toBe(true);
        expect(
            textNamesOrganism("Prevalence of Listeria", "Salmonella spp.")
        ).toBe(false);
    });

    test("rebases a link onto the site under test", () => {
        expect(
            rebaseToSite(
                "https://zoonotify.bfr.berlin/prevalence?lang=en",
                "https://zoonotify-dev.bfr.berlin"
            )
        ).toBe("https://zoonotify-dev.bfr.berlin/prevalence?lang=en");
    });
});
