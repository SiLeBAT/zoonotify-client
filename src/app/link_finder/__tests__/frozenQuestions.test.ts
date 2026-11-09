// Regression suite: the frozen questions run through the facade against the committed
// snapshot. A floor, not proof of quality (see issue 102, Further Notes).
import { createLinkFinder, Dim, EverydayWord, FoundLink } from "..";
import { decodeSubstanceState } from "../../antibiotic_resistance/pages/substanceUrlState";
import {
    newestYearInSnapshot,
    snapshotIndex,
    snapshotOfficialNames,
} from "../__fixtures__/snapshot";
import { FROZEN, fits } from "../__fixtures__/pins";
import { checkEverydayWords } from "../wordList";
import everydayWords from "../wordList/everyday-words.json";

const finder = createLinkFinder(() => Promise.resolve(snapshotOfficialNames));

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

/** The hard gates every shown link must pass, whatever the question. */
function gateFailures(link: FoundLink, lang: string): string[] {
    const fails = outOfList(link).map((v) => `out-of-list ${v}`);
    if (newestYearInSnapshot(link) === undefined) fails.push("empty link");
    const url = new URL(link.url, "https://zoonotify.test");
    if (url.searchParams.get("lang") !== lang) fails.push("?lang=");
    const s = url.searchParams.get("s");
    if (s !== null && decodeSubstanceState(s)?.lang !== lang)
        fails.push("payload language");
    if (link.view === "trend")
        url.searchParams.forEach((value, key) => {
            if (key !== "microorganism" && value.indexOf(",") >= 0)
                fails.push(`trend comma ${key}`);
        });
    return fails;
}

describe("frozen questions", () => {
    it("runs on a word list whose everyday words all point at snapshot values", () => {
        expect(
            checkEverydayWords(
                snapshotOfficialNames,
                everydayWords as unknown as EverydayWord[]
            )
        ).toEqual([]);
    });

    it("covers all 30: EN 1-12 and DE G1-G18", () => {
        expect(FROZEN.map((p) => p.id)).toEqual(
            Array.from({ length: 12 }, (_, i) => String(i + 1)).concat(
                Array.from({ length: 18 }, (_, i) => `G${i + 1}`)
            )
        );
    });

    it.each(FROZEN.map((pin) => [pin.id, pin.question, pin]))(
        "%s passes the hard gates: %s",
        async (_id, _question, pin) => {
            const result = await finder.find(
                pin.question,
                pin.lang,
                snapshotIndex
            );

            expect(result.links.length).toBeLessThanOrEqual(3);
            expect(
                result.links.flatMap((link) => gateFailures(link, pin.lang))
            ).toEqual([]);
        }
    );

    it.each(
        FROZEN.filter((pin) => !pin.notInData).map((pin) => [
            pin.id,
            pin.question,
            pin,
        ])
    )(
        "%s keeps an accepted link in the top three: %s",
        async (_id, _q, pin) => {
            const result = await finder.find(
                pin.question,
                pin.lang,
                snapshotIndex
            );

            expect(
                result.links.some((link) =>
                    pin.accept.some((alt) => fits(link, alt))
                )
            ).toBe(true);
        }
    );
});

describe("not-in-data questions (12, G12)", () => {
    it.each(FROZEN.filter((pin) => pin.notInData).map((pin) => [pin.id, pin]))(
        "%s shows no link carrying a substance and names temocillin unmatched",
        async (_id, pin) => {
            const result = await finder.find(
                pin.question,
                pin.lang,
                snapshotIndex
            );

            expect(
                result.links.filter((l) => l.filters.antimicrobialSubstance)
            ).toEqual([]);
            expect(result.unmatched.map((w) => w.toLowerCase())).toContain(
                "temocillin"
            );
        }
    );
});

describe("aggregation traps (10, 11, G10, G11)", () => {
    it.each(
        FROZEN.filter((p) => ["10", "11", "G10", "G11"].indexOf(p.id) >= 0).map(
            (pin) => [pin.id, pin]
        )
    )("%s gives per-species links only", async (_id, pin) => {
        const result = await finder.find(pin.question, pin.lang, snapshotIndex);

        expect(result.links.length).toBeGreaterThan(0);
        for (const link of result.links) {
            expect(link.page).toBe("amr");
            expect(link.filters.microorganism).toHaveLength(1);
            expect((link.filters.specie ?? []).length).toBeLessThanOrEqual(1);
        }
    });
});
