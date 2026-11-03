import { APIRequestContext, expect, test } from "@playwright/test";
import {
    compareOptions,
    facetOptions,
    loadFacetRows,
    toFacetRows,
} from "./release/support/prevalence-filters";

/**
 * The prevalence filter oracle's own rules. They run in the CMS-free sweep so
 * the oracle cannot rot between release runs.
 */

const rel = (documentId: string, name: string) => ({ documentId, name });

const items = [
    {
        samplingYear: 2020,
        microorganism: rel("m1", "Salmonella spp."),
        matrix: rel("x1", "Fresh meat"),
        superCategorySampleOrigin: rel("s1", "Animal"),
    },
    {
        samplingYear: 2021,
        microorganism: rel("m2", "E. coli"),
        matrix: rel("x1", "Fresh meat"),
        superCategorySampleOrigin: rel("s1", "Animal"),
    },
    {
        samplingYear: 2022,
        microorganism: rel("m3", "Enterococcus faecium"),
        matrix: rel("x2", "Milk"),
        superCategorySampleOrigin: rel("s2", "Food"),
    },
    {
        samplingYear: 2022,
        microorganism: rel("m4", "Campylobacter spp."),
        matrix: rel("x2", "Milk"),
        superCategorySampleOrigin: rel("s2", "Food"),
    },
];
const rows = toFacetRows(items);
const names = (o: { name: string }[]) => o.map((x) => x.name);

test.describe("facetOptions", () => {
    test("lists every value sorted, hiding E. coli and Enterococcus", () => {
        expect(names(facetOptions(rows, {}, "microorganism"))).toEqual([
            "Campylobacter spp.",
            "Salmonella spp.",
        ]);
    });

    test("years are numeric and ascending", () => {
        expect(names(facetOptions(rows, {}, "year"))).toEqual([
            "2020",
            "2021",
            "2022",
        ]);
    });

    test("a selection narrows the other dimensions, not its own", () => {
        const selection = { superCategory: ["s2"] };
        expect(names(facetOptions(rows, selection, "matrix"))).toEqual([
            "Milk",
        ]);
        expect(names(facetOptions(rows, selection, "year"))).toEqual(["2022"]);
        expect(names(facetOptions(rows, selection, "superCategory"))).toEqual([
            "Animal",
            "Food",
        ]);
    });

    test("rows lacking a relation never offer that dimension", () => {
        const sparse = toFacetRows([{ samplingYear: 2020 }]);
        expect(facetOptions(sparse, {}, "matrix")).toEqual([]);
    });
});

test.describe("compareOptions", () => {
    const expected = facetOptions(rows, {}, "matrix");

    test("accepts the same names, whitespace-normalised", () => {
        expect(compareOptions(expected, ["Fresh  meat", "Milk"])).toBeNull();
    });

    test("fails on a missing value", () => {
        expect(compareOptions(expected, ["Fresh meat"])).toContain("Milk");
    });

    test("fails on an unexpected value", () => {
        expect(
            compareOptions(expected, ["Fresh meat", "Milk", "Honey"])
        ).toContain("Honey");
    });

    test("leaves order to the browser-side sort check", () => {
        expect(compareOptions(expected, ["Milk", "Fresh meat"])).toBeNull();
    });
});

test("loading more rows than the client fetches trips the truncation guard", async () => {
    // Restored afterwards: a worker is reused, and smoke.spec reads this
    // variable to decide whether the run is against a deployment.
    const previous = process.env.E2E_BASE_URL;
    process.env.E2E_BASE_URL ??= "http://oracle.invalid";
    const tooMany = {
        get: async () => ({
            status: () => 200,
            json: async () => ({
                data: [],
                meta: { pagination: { total: 901 } },
            }),
        }),
    } as unknown as APIRequestContext;
    try {
        await expect(loadFacetRows(tooMany, "en")).rejects.toThrow(/901/);
    } finally {
        if (previous === undefined) delete process.env.E2E_BASE_URL;
        else process.env.E2E_BASE_URL = previous;
    }
});
