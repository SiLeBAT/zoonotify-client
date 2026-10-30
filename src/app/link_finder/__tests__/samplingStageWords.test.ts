import { createLinkFinder, FoundLink } from "..";
import { snapshotIndex, snapshotOfficialNames } from "../__fixtures__/snapshot";

const IMPORT = "Points of import";
const BORDER = "Border control posts";

function snapshotFinder(): ReturnType<typeof createLinkFinder> {
    return createLinkFinder(() => Promise.resolve(snapshotOfficialNames));
}

/** The link carries the stages asked for, or is offered as the closest match instead. */
function honoursStages(link: FoundLink, stages: string[]): boolean {
    const got = link.filters.samplingStage ?? [];
    const exact =
        got.length === stages.length && stages.every((s) => got.includes(s));
    return exact || link.closest === true;
}

describe("Link Finder: sampling-stage everyday words", () => {
    it.each([
        ["en", "imported chicken meat at the border 2022"],
        ["de", "importiertes Hähnchenfleisch an der Grenze 2022"],
        ["de", "Einfuhr von Hähnchenfleisch, Grenzkontrolle 2022"],
    ] as const)(
        "%s: an import-and-border question sets both stages (%s)",
        async (lang, question) => {
            const result = await snapshotFinder().find(
                question,
                lang,
                snapshotIndex
            );

            expect(result.unmatched).toEqual([]);
            expect(result.links.length).toBeGreaterThan(0);
            // The snapshot holds chicken meat sampled at import and border posts: an exact link.
            expect(result.links[0].closest).toBeFalsy();
            expect(
                [...(result.links[0].filters.samplingStage ?? [])].sort()
            ).toEqual([BORDER, IMPORT]);
        }
    );

    it.each([
        ["en", "Salmonella in imported meat", [IMPORT]],
        ["en", "Salmonella in meat at border control", [BORDER]],
        ["de", "Salmonellen in Fleisch aus der Einfuhr", [IMPORT]],
        ["de", "Salmonellen in Fleisch an der Grenze", [BORDER]],
    ] as const)(
        "%s: one stage word sets its own stage (%s)",
        async (lang, question, stages) => {
            const result = await snapshotFinder().find(
                question,
                lang,
                snapshotIndex
            );

            expect(result.unmatched).toEqual([]);
            expect(result.links.length).toBeGreaterThan(0);
            expect(
                honoursStages(result.links[0], stages as unknown as string[])
            ).toBe(true);
        }
    );
});
