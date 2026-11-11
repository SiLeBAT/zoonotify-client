import {
    cmsDataIndex,
    cmsOfficialNames,
    createLinkFinder,
    FoundLink,
} from "..";
import {
    decodeMultiResistanceState,
    MultiResistanceItem,
} from "../../antibiotic_resistance/pages/multiResistanceHelpers";
import { MINIMUM_N } from "../../antibiotic_resistance/pages/resistanceHelpers";
import {
    fakeCms,
    newestYearInSnapshot,
    snapshotIndex,
    snapshotOfficialNames,
} from "../__fixtures__/snapshot";

const API = "https://cms.example.test/cms/api";
const finder = createLinkFinder(() => Promise.resolve(snapshotOfficialNames));
const found = async (
    text: string,
    lang: "en" | "de",
    organism?: string
): Promise<FoundLink[]> =>
    (await finder.find(text, lang, snapshotIndex, organism)).links;
const views = async (
    text: string,
    lang: "en" | "de",
    organism?: string
): Promise<string[]> =>
    (await found(text, lang, organism)).map((l) => `${l.page}/${l.view ?? ""}`);

/** A row of the page's data, naming one value: the decoder maps names back through rows. */
const rowOf = (superCategory: string): MultiResistanceItem => ({
    id: 1,
    samplingYear: 2022,
    resistanceGroup: 0,
    anzahlIsolate: 1,
    anzahlGetesteterIsolate: 10,
    superCategorySampleOrigin: {
        id: 1,
        name: superCategory,
        documentId: "pig-id",
    },
});

describe("Link Finder Multi-resistance graph link", () => {
    it("takes the third slot of a resistance search, after Substance and trend", async () => {
        expect(
            await views("antimicrobial resistance", "en", "Salmonella spp.")
        ).toEqual(["amr/substance", "amr/trend", "amr/multi"]);
    });

    it.each(["en", "de"] as const)(
        "opens the graph with the filters set, in the page's own payload and language (%s)",
        async (lang) => {
            const links = await found(
                lang === "en"
                    ? "antimicrobial resistance salmonella 2022"
                    : "Resistenz Salmonellen 2022",
                lang
            );
            const multi = links.find((l) => l.view === "multi");
            expect(multi).toBeDefined();
            const url = new URL(multi?.url ?? "", "https://x");
            expect(url.pathname).toBe("/antibiotic-resistance");
            expect(url.searchParams.get("lang")).toBe(lang);
            const state = decodeMultiResistanceState(
                url.searchParams.get("s") ?? "",
                []
            );
            expect(state?.lang).toBe(lang);
            expect(state?.microorganism).toBe("Salmonella spp.");
            expect(state?.year).toBe(2022);
            expect(state?.combinations).toEqual([]);
        }
    );

    it("carries the search's other filters, named in the link's language", async () => {
        const links = await found("Resistenz Salmonellen aus Schweinen", "de");
        const multi = links.find((l) => l.view === "multi");
        expect(multi).toBeDefined();
        const state = decodeMultiResistanceState(
            new URL(multi?.url ?? "", "https://x").searchParams.get("s") ?? "",
            [rowOf("Schwein")]
        );
        expect(state?.selected.superCategorySampleOrigin).toEqual(["pig-id"]);
        expect(state?.year).toBeUndefined();
    });

    it("leaves the link out when a substance is asked for: the graph has no substance filter", async () => {
        const v = await views("Salmonellen gegen Ampicillin", "de");
        expect(v.length).toBeGreaterThan(0);
        expect(v).not.toContain("amr/multi");
    });

    it("leaves the link out where the Multi-resistance data has none for the organism", async () => {
        const v = await views(
            "antimicrobial resistance",
            "en",
            "CARBA-E. coli"
        );
        expect(v).not.toContain("amr/multi");
    });

    it("never keeps a closest Multi-resistance link", async () => {
        const links = await found("Salmonellen aus Rindern", "de");
        expect(links.filter((l) => l.view === "multi" && l.closest)).toEqual(
            []
        );
    });

    it("lets prevalence, Substance and trend links keep their slots in an organism-only search", async () => {
        const v = await views("salmonella", "en");
        expect(v).toEqual(["prevalence/", "amr/substance", "amr/trend"]);
    });

    it("checks the multi-resistances collection with the graph's own minimum", async () => {
        const cms = fakeCms(API);
        const index = cmsDataIndex(API, cms.fetch);
        const link = {
            page: "amr" as const,
            view: "multi" as const,
            filters: { microorganism: ["Salmonella spp."] },
        };
        expect(await index.newestYear(link)).toBe(newestYearInSnapshot(link));
        expect(await index.newestYear(link)).toBeDefined();
        const req = cms.requests.filter((u) =>
            u.includes("/multi-resistances?")
        );
        expect(req.length).toBeGreaterThan(0);
        expect(decodeURIComponent(req[0])).toContain(
            `filters[anzahlGetesteterIsolate][$gte]=${MINIMUM_N}`
        );
        expect(cms.requests.some((u) => u.includes("/resistances?"))).toBe(
            false
        );
    });

    it("counts no combination under the minimum: Salmonella in minced meat has at most 8 tested isolates", async () => {
        const index = cmsDataIndex(API, fakeCms(API).fetch);
        const thin = {
            page: "amr" as const,
            view: "multi" as const,
            filters: {
                microorganism: ["Salmonella spp."],
                matrix: ["Minced meat"],
            },
        };
        expect(await index.newestYear(thin)).toBeUndefined();
        expect(
            await index.newestYear({
                ...thin,
                filters: { microorganism: ["Salmonella spp."] },
            })
        ).toBeDefined();
    });

    it("sends official values only through the full facade", async () => {
        const cms = fakeCms(API);
        const real = createLinkFinder(cmsOfficialNames(API, cms.fetch));
        const result = await real.find(
            "Resistenz Salmonellen quixotrumbel",
            "de",
            cmsDataIndex(API, cms.fetch)
        );
        expect(result.links.some((l) => l.view === "multi")).toBe(true);
        for (const url of cms.requests)
            expect(decodeURIComponent(url).toLowerCase()).not.toContain(
                "quixotrumbel"
            );
    });
});
