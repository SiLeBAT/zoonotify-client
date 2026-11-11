import { createLinkFinder } from "..";
import { snapshotIndex, snapshotOfficialNames } from "../__fixtures__/snapshot";

const finder = createLinkFinder(() => Promise.resolve(snapshotOfficialNames));

describe("page words", () => {
    it.each([
        ["antimicrobial use", "en", "/antimicrobial?lang=en"],
        ["Antibiotikaeinsatz", "de", "/antimicrobial?lang=de"],
        ["microbial counts", "en", "/microbial-counts?lang=en"],
        ["Keimzahlen", "de", "/microbial-counts?lang=de"],
        ["evaluations", "en", "/evaluations?lang=en"],
        ["Auswertungen", "de", "/evaluations?lang=de"],
        ["Antimicrobial Use", "en", "/antimicrobial?lang=en"],
        ["Keimzahl", "de", "/microbial-counts?lang=de"],
    ] as const)(
        "%s opens one link to its page, with no filter labels",
        async (text, lang, url) => {
            const result = await finder.find(text, lang, snapshotIndex);

            expect(result.links).toHaveLength(1);
            expect(result.links[0].url).toBe(url);
            expect(result.links[0].labels).toEqual([]);
            expect(result.unmatched).toEqual([]);
        }
    );

    it("leaves a search that also names filters to the data pages", async () => {
        const result = await finder.find(
            "Salmonella evaluations",
            "en",
            snapshotIndex
        );

        expect(result.links.every((l) => l.page !== undefined)).toBe(true);
        expect(result.links.some((l) => l.url.startsWith("/evaluations"))).toBe(
            false
        );
    });
});
