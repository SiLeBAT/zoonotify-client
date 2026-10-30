import {
    cmsDataIndex,
    cmsOfficialNames,
    createLinkFinder,
    FoundLink,
} from "..";
import { decodeSubstanceState } from "../../antibiotic_resistance/pages/substanceUrlState";
import {
    fakeCms,
    newestYearInSnapshot,
    snapshotIndex,
    snapshotOfficialNames,
} from "../__fixtures__/snapshot";

const CAMPY = "Campylobacter spp.";
const MRSA = "Methicillin-resistant Staphylococcus aureus (MRSA)";

const finder = createLinkFinder(() => Promise.resolve(snapshotOfficialNames));

function payload(link: FoundLink): ReturnType<typeof decodeSubstanceState> {
    return decodeSubstanceState(
        new URL(link.url, "https://x").searchParams.get("s")
    );
}

describe("Link Finder on the antibiotic resistance page", () => {
    it("answers a resistance lookup with a Substance graph link whose payload language is ?lang=", async () => {
        const result = await finder.find(
            "cipro resistenz campylobacter hänchen 2024",
            "de",
            snapshotIndex
        );

        const link = result.links[0];
        expect(link).toMatchObject({
            page: "amr",
            view: "substance",
            years: [2024],
            filters: {
                microorganism: [CAMPY],
                superCategorySampleOrigin: ["Chicken"],
                antimicrobialSubstance: ["CIP"],
            },
        });
        expect(link.url).toMatch(/^\/antibiotic-resistance\?s=[^&]+&lang=de$/);
        const decoded = payload(link);
        expect(decoded).toMatchObject({
            microorganism: CAMPY,
            lang: "de",
            chartYear: 2024,
            substanceFilter: ["CIP"],
        });
        expect(decoded?.selected.superCategorySampleOrigin).toEqual(["Huhn"]);
        expect(decoded?.selected.samplingYear).toEqual(["2024"]);
    });

    it("writes the AMR page's own organism label into the payload", async () => {
        const result = await finder.find(
            "MRSA aus Putenfleisch Tetracyclin",
            "en",
            snapshotIndex
        );

        const link = result.links[0];
        expect(link.page).toBe("amr");
        expect(link.filters.microorganism).toEqual([MRSA]);
        expect(link.url).toMatch(/&lang=en$/);
        expect(payload(link)).toMatchObject({
            microorganism: "MRSA",
            lang: "en",
        });
        expect(payload(link)?.selected.superCategorySampleOrigin).toEqual([
            "Turkey",
        ]);
    });

    it("never shows an AMR link below the isolate minimum", async () => {
        const result = await finder.find(
            "cipro resistance campylobacter chicken 2024",
            "en",
            snapshotIndex
        );

        expect(result.links.length).toBeGreaterThan(0);
        for (const link of result.links)
            expect(newestYearInSnapshot(link)).toBeDefined();
    });

    it("opens the trend view for a trend question, with plain params and ?lang=", async () => {
        const result = await finder.find(
            "How has ciprofloxacin resistance in C. jejuni from broilers developed over the years?",
            "en",
            snapshotIndex
        );

        const link = result.links[0];
        expect(link).toMatchObject({
            page: "amr",
            view: "trend",
            filters: {
                microorganism: [CAMPY],
                specie: ["C. jejuni"],
                sampleOrigin: ["Broilers"],
                antimicrobialSubstance: ["CIP"],
            },
        });
        const q = new URL(link.url, "https://x").searchParams;
        expect(new URL(link.url, "https://x").pathname).toBe(
            "/antibiotic-resistance"
        );
        expect(q.get("view")).toBe("trend");
        expect(q.get("microorganism")).toBe(CAMPY);
        expect(q.get("specie")).toBe("C. jejuni");
        expect(q.get("sampleOrigin")).toBe("Broilers");
        expect(q.get("antimicrobialSubstance")).toBe("CIP");
        expect(q.get("lang")).toBe("en");
        expect(q.get("s")).toBeNull();
    });

    it("never builds a trend link carrying a value with a comma, in either language", async () => {
        for (const lang of ["de", "en"] as const) {
            const result = await finder.find(
                "Verlauf der Ciprofloxacin-Resistenz bei Campylobacter aus Rindern",
                lang,
                snapshotIndex
            );

            expect(result.links.length).toBeGreaterThan(0);
            for (const link of result.links) {
                if (link.view !== "trend") continue;
                new URL(link.url, "https://x").searchParams.forEach(
                    (value, key) => {
                        if (key === "microorganism" || key === "view") return;
                        expect(value).not.toContain(",");
                    }
                );
            }
            expect(
                result.links.some(
                    (l) =>
                        l.view === "substance" &&
                        (l.filters.superCategorySampleOrigin ?? []).indexOf(
                            "Cattle, bovine animals"
                        ) >= 0
                )
            ).toBe(true);
        }
    });

    it("never links an organism the AMR page lists as Coming soon, and falls back to prevalence", async () => {
        const API = "https://cms.example.test/cms/api";
        const cms = fakeCms(API);
        const cmsFinder = createLinkFinder(cmsOfficialNames(API, cms.fetch));

        const result = await cmsFinder.find(
            "ESBL/AmpC E. coli Resistenz gegen Ampicillin bei Schafen",
            "de",
            cmsDataIndex(API, cms.fetch)
        );

        expect(cms.requests.some((u) => u.includes("/resistances?"))).toBe(
            false
        );
        expect(result.links.length).toBeGreaterThan(0);
        for (const link of result.links) expect(link.page).toBe("prevalence");
    });
});
