import { createLinkFinder, DataIndex } from "..";
import { snapshotIndex, snapshotOfficialNames } from "../__fixtures__/snapshot";

const finder = createLinkFinder(() => Promise.resolve(snapshotOfficialNames));

describe("Link Finder closest links", () => {
    it("names the filter a closest AMR link dropped, by its official name in the search language", async () => {
        const result = await finder.find(
            "Wie resistent sind Salmonellen aus Rindern gegen Ampicillin?",
            "de",
            snapshotIndex
        );

        expect(result.links.length).toBeGreaterThan(0);
        for (const link of result.links) {
            expect(link.closest).toBe(true);
            expect(link.dropped).toEqual([
                { dim: "superCategorySampleOrigin", text: "Rind" },
            ]);
        }
    });

    it("names what a closest prevalence link dropped: the year, or the visitor's sample origins", async () => {
        const result = await finder.find(
            "Salmonella in veal 2009",
            "en",
            snapshotIndex
        );

        expect(result.links.map((l) => l.dropped)).toEqual([
            [{ dim: "samplingYear", text: "2009" }],
            [
                {
                    dim: "sampleOrigin",
                    text: "Fattening calves (under or up to 1 year)",
                },
                {
                    dim: "sampleOrigin",
                    text: "Fattening calves (for slaughter at 12 months of age at the latest)",
                },
                {
                    dim: "sampleOrigin",
                    text: "Fattening calves (raised on beef cattle farms)",
                },
                {
                    dim: "sampleOrigin",
                    text: "Fattening calvesg (raised on dairy farms)",
                },
            ],
        ]);
    });

    it("reports nothing dropped for an exact link", async () => {
        const result = await finder.find(
            "STEC in Rinderhackfleisch",
            "de",
            snapshotIndex
        );

        expect(result.links.length).toBeGreaterThan(0);
        for (const link of result.links) {
            expect(link.closest).toBeFalsy();
            expect(link.dropped).toEqual([]);
        }
    });

    it("shows one link where two species' closest links coincide, naming both species dropped", async () => {
        // Data only at genus level: each species link relaxes to the same genus link.
        const genusOnly: DataIndex = {
            newestYear: (link) =>
                Promise.resolve(link.filters.specie ? undefined : 2024),
        };

        const result = await finder.find(
            "Ciprofloxacin resistance C. coli and C. jejuni in chicken",
            "en",
            genusOnly
        );

        expect(result.links).toHaveLength(1);
        expect(result.links[0].filters.specie).toBeUndefined();
        expect(result.links[0].dropped).toEqual([
            { dim: "specie", text: "C. coli" },
            { dim: "specie", text: "C. jejuni" },
        ]);
    });
});
