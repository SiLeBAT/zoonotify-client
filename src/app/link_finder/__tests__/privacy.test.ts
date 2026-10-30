import { cmsDataIndex, cmsOfficialNames, createLinkFinder } from "..";
import { fakeCms, newestYearInSnapshot } from "../__fixtures__/snapshot";

const API = "https://cms.example.test/cms/api";

describe("Link Finder over the CMS public API", () => {
    it("never sends the search text: requests carry official values only", async () => {
        const cms = fakeCms(API);
        const finder = createLinkFinder(cmsOfficialNames(API, cms.fetch));

        const result = await finder.find(
            "Salmonellen quixotrumbel in Kalbfleisch",
            "de",
            cmsDataIndex(API, cms.fetch)
        );

        expect(result.links.length).toBeGreaterThan(0);
        expect(result.unmatched).toEqual(["quixotrumbel"]);
        const checks = cms.requests.filter((u) => u.includes("/prevalences?"));
        expect(checks.length).toBeGreaterThan(0);
        for (const url of cms.requests) {
            const decoded = decodeURIComponent(url).toLowerCase();
            expect(decoded).not.toContain("quixotrumbel");
            expect(decoded).not.toContain("kalbfleisch");
            expect(decoded).not.toContain("salmonellen");
        }
    });

    it("loads the official names once per session, joining both locales", async () => {
        const cms = fakeCms(API);
        const finder = createLinkFinder(cmsOfficialNames(API, cms.fetch));
        const index = cmsDataIndex(API, cms.fetch);

        const first = await finder.find(
            "STEC in Rinderhackfleisch",
            "de",
            index
        );
        const loads = cms.requests.filter((u) =>
            u.includes("matrices?")
        ).length;
        await finder.find("Listerien", "de", index);

        expect(first.links[0].url).toBe(
            "/prevalence?superCategorySampleOrigin=Rind&matrix=Hackfleisch&microorganism=Shigatoxin-bildende+E.+coli+%28STEC%29&lang=de"
        );
        expect(loads).toBe(2);
        expect(cms.requests.filter((u) => u.includes("matrices?")).length).toBe(
            2
        );
    });

    it("checks AMR links against resistances, counting only rows at the isolate minimum", async () => {
        const cms = fakeCms(API);
        const finder = createLinkFinder(cmsOfficialNames(API, cms.fetch));

        const result = await finder.find(
            "Salmonellen aus Rindern gegen Ampicillin",
            "de",
            cmsDataIndex(API, cms.fetch)
        );

        const checks = cms.requests.filter((u) => u.includes("/resistances?"));
        expect(checks.length).toBeGreaterThan(0);
        for (const url of checks)
            expect(
                new URL(url).searchParams.get(
                    "filters[anzahlGetesteterIsolate][$gte]"
                )
            ).toBe("10");
        expect(result.links.length).toBeGreaterThan(0);
        for (const link of result.links)
            expect(newestYearInSnapshot(link)).toBeDefined();
    });
});
