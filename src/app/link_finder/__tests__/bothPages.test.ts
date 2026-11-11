import { createLinkFinder } from "..";
import {
    snapshotIndex,
    snapshotOfficialNames,
} from "../__fixtures__/snapshot";

const finder = createLinkFinder(() => Promise.resolve(snapshotOfficialNames));
const pages = async (text: string, lang: "en" | "de"): Promise<string[]> =>
    (await finder.find(text, lang, snapshotIndex)).links.map((l) => l.page);

describe("Link Finder page choice for a search naming only an organism", () => {
    it.each([
        ["salmonella", "en"],
        ["Salmonellen", "de"],
    ] as const)(
        "offers a prevalence link, then a resistance link, for %s",
        async (text, lang) => {
            const found = await pages(text, lang);
            expect(found[0]).toBe("prevalence");
            expect(found).toContain("amr");
            expect(found.length).toBeLessThanOrEqual(3);
        }
    );

    it.each([
        ["e. coli", "en"],
        ["E. coli", "de"],
    ] as const)(
        "falls back to resistance links for %s, which has no prevalence data",
        async (text, lang) => {
            const found = await pages(text, lang);
            expect(found.length).toBeGreaterThan(0);
            expect(new Set(found)).toEqual(new Set(["amr"]));
        }
    );

    it.each([
        ["salmonella resistance", "en"],
        ["Salmonellen Resistenz", "de"],
        ["salmonella ampicillin", "en"],
    ] as const)("keeps %s on resistance only", async (text, lang) => {
        const found = await pages(text, lang);
        expect(found.length).toBeGreaterThan(0);
        expect(new Set(found)).toEqual(new Set(["amr"]));
    });

    it.each([
        ["salmonella prevalence", "en"],
        ["Salmonellen Prävalenz", "de"],
    ] as const)("keeps %s on prevalence only", async (text, lang) => {
        const found = await pages(text, lang);
        expect(found.length).toBeGreaterThan(0);
        expect(new Set(found)).toEqual(new Set(["prevalence"]));
    });
});
