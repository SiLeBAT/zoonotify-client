// Regression suite: the frozen questions run through the facade against the committed
// snapshot. A floor, not proof of quality (see issue 102, Further Notes).
import { createLinkFinder, Dim, EverydayWord, FoundLink } from "..";
import {
    newestYearInSnapshot,
    snapshotIndex,
    snapshotOfficialNames,
} from "../__fixtures__/snapshot";
import { FROZEN, fits } from "../__fixtures__/pins";
import { checkEverydayWords } from "../wordList";
import everydayWords from "../wordList/everyday-words.json";

const finder = createLinkFinder(() => Promise.resolve(snapshotOfficialNames));

/** Questions whose expected page is prevalence. The AMR ones join with ticket 105. */
const PREVALENCE_PINS = FROZEN.filter(
    (pin) =>
        pin.accept.length > 0 &&
        pin.accept.every((alt) => alt.page === "prevalence")
);

function outOfList(link: FoundLink): string[] {
    return (Object.keys(link.filters) as Dim[]).flatMap((dim) =>
        (link.filters[dim] ?? [])
            .filter(
                (v) =>
                    !(snapshotOfficialNames.values[dim] ?? []).some(
                        (p) => p.en === v
                    )
            )
            .map((v) => `${dim}=${v}`)
    );
}

describe("frozen questions answered on the prevalence page", () => {
    it("runs on a word list whose everyday words all point at snapshot values", () => {
        expect(
            checkEverydayWords(
                snapshotOfficialNames,
                everydayWords as unknown as EverydayWord[]
            )
        ).toEqual([]);
    });

    it("covers EN 3, 5, 7 and DE G3, G5, G7, G13-G15, G17", () => {
        expect(PREVALENCE_PINS.map((p) => p.id)).toEqual([
            "3",
            "5",
            "7",
            "G3",
            "G5",
            "G7",
            "G13",
            "G14",
            "G15",
            "G17",
        ]);
    });

    it.each(PREVALENCE_PINS.map((pin) => [pin.id, pin.question, pin]))(
        "%s: %s",
        async (_id, _question, pin) => {
            const result = await finder.find(
                pin.question,
                pin.lang,
                snapshotIndex
            );

            expect(result.links.length).toBeLessThanOrEqual(3);
            expect(
                result.links.some((link) =>
                    pin.accept.some((alt) => fits(link, alt))
                )
            ).toBe(true);
            for (const link of result.links) {
                expect(outOfList(link)).toEqual([]);
                expect(newestYearInSnapshot(link)).toBeDefined();
                expect(link.url).toContain(`lang=${pin.lang}`);
            }
        }
    );
});
