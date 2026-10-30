import { createLinkFinder, LinkFinderUnavailableError } from "..";
import {
    newestYearInSnapshot,
    snapshotIndex,
    snapshotOfficialNames,
} from "../__fixtures__/snapshot";

const SALM = "Salmonella spp.";
const CALVES = [
    "Fattening calves (under or up to 1 year)",
    "Fattening calves (for slaughter at 12 months of age at the latest)",
    "Fattening calves (raised on beef cattle farms)",
    "Fattening calvesg (raised on dairy farms)",
];

function snapshotFinder(): ReturnType<typeof createLinkFinder> {
    return createLinkFinder(() => Promise.resolve(snapshotOfficialNames));
}

describe("Link Finder", () => {
    it("answers a German compound question with a prevalence link carrying exactly its filters", async () => {
        const result = await snapshotFinder().find(
            "Salmonellen in Kalbfleisch",
            "de",
            snapshotIndex
        );

        expect(result.links[0]).toMatchObject({
            page: "prevalence",
            filters: {
                microorganism: [SALM],
                sampleOrigin: CALVES,
                matrix: ["Fresh meat"],
            },
        });
        expect(Object.keys(result.links[0].filters).sort()).toEqual([
            "matrix",
            "microorganism",
            "sampleOrigin",
        ]);
        expect(result.unmatched).toEqual([]);
    });

    it("builds the link in the language asked for, with labels in that language", async () => {
        const finder = snapshotFinder();
        const de = await finder.find(
            "STEC in Rinderhackfleisch",
            "de",
            snapshotIndex
        );
        const en = await finder.find(
            "STEC in Rinderhackfleisch",
            "en",
            snapshotIndex
        );

        expect(de.links[0].url).toBe(
            "/prevalence?superCategorySampleOrigin=Rind&matrix=Hackfleisch&microorganism=Shigatoxin-bildende+E.+coli+%28STEC%29&lang=de"
        );
        expect(de.links[0].labels.map((l) => l.text)).toEqual([
            "Rind",
            "Hackfleisch",
            "Shigatoxin-bildende E. coli (STEC)",
        ]);
        expect(en.links[0].url).toBe(
            "/prevalence?superCategorySampleOrigin=Cattle%2C+bovine+animals&matrix=Minced+meat&microorganism=Shigatoxin-producing+E.+coli+%28STEC%29&lang=en"
        );
        expect(en.links[0].labels.map((l) => l.text)).toEqual([
            "Cattle, bovine animals",
            "Minced meat",
            "Shigatoxin-producing E. coli (STEC)",
        ]);
    });

    it("labels a year and resolves 'latest' to the newest year with data", async () => {
        const result = await snapshotFinder().find(
            "Listeria monocytogenes latest year",
            "en",
            snapshotIndex
        );

        expect(result.links[0]).toMatchObject({
            filters: { microorganism: ["Listeria monocytogenes"] },
            years: [2024],
        });
        expect(result.links[0].labels).toContainEqual({
            dim: "samplingYear",
            text: "2024",
        });
    });

    it("names the words that matched nothing, as typed", async () => {
        const result = await snapshotFinder().find(
            "Salmonellen in Kalbfleisch Grünzeugbörse",
            "de",
            snapshotIndex
        );

        expect(result.links.length).toBeGreaterThan(0);
        expect(result.unmatched).toEqual(["Grünzeugbörse"]);
    });

    it("returns no links for a search that matches nothing", async () => {
        const result = await snapshotFinder().find(
            "blorptazine",
            "en",
            snapshotIndex
        );

        expect(result).toEqual({ links: [], unmatched: ["blorptazine"] });
    });

    it("never shows a link without data: an empty year gives way to a closest link", async () => {
        const result = await snapshotFinder().find(
            "Salmonellen in Kalbfleisch 2009",
            "de",
            snapshotIndex
        );

        expect(result.links.length).toBeGreaterThan(0);
        for (const link of result.links) {
            expect(newestYearInSnapshot(link)).toBeDefined();
            expect(link.closest).toBe(true);
        }
    });

    it("answers a resistance question with prevalence links only, until AMR links exist", async () => {
        const result = await snapshotFinder().find(
            "cipro resistance campylobacter chiken 2024",
            "en",
            snapshotIndex
        );

        for (const link of result.links) expect(link.page).toBe("prevalence");
    });

    it("reports the search unavailable when the official names cannot be loaded, and retries", async () => {
        const load = jest
            .fn()
            .mockRejectedValueOnce(new Error("CMS down"))
            .mockResolvedValue(snapshotOfficialNames);
        const finder = createLinkFinder(load);

        await expect(
            finder.find("Salmonellen", "de", snapshotIndex)
        ).rejects.toBeInstanceOf(LinkFinderUnavailableError);
        const second = await finder.find("Salmonellen", "de", snapshotIndex);
        await finder.find("Listerien", "de", snapshotIndex);

        expect(second.links.length).toBeGreaterThan(0);
        expect(load).toHaveBeenCalledTimes(2);
    });
});
