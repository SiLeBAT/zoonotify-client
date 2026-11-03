import { expect, test } from "@playwright/test";
import {
    Draw,
    drawnYears,
    expectedTitleWords,
    hasItalicWord,
    latestPass,
    titleProblems,
} from "./release/support/canvas-spy";

/**
 * The canvas spy's pure rules, in the CMS-free sweep so the figure checks'
 * italic assertion cannot rot between release runs.
 */

const draw = (text: string, font: string, pass = 1, onScreen = true): Draw => ({
    text,
    font,
    pass,
    onScreen,
    width: 1380,
    height: 1000,
});

const ITALIC = "italic bold 19px Arial";
const UPRIGHT = "bold 19px Arial";

test.describe("expectedTitleWords", () => {
    test("italicises organism words from the list and nothing else", () => {
        expect(expectedTitleWords("Salmonella spp.")).toEqual([
            { text: "Salmonella", italic: true },
            { text: " ", italic: false },
            { text: "spp.", italic: false },
        ]);
    });

    test("keeps hyphens upright and splits on them", () => {
        expect(expectedTitleWords("CARBA-E. coli")).toEqual([
            { text: "CARBA", italic: false },
            { text: "-", italic: false },
            { text: "E.", italic: true },
            { text: " ", italic: false },
            { text: "coli", italic: true },
        ]);
    });

    test("hasItalicWord", () => {
        expect(hasItalicWord("Listeria monocytogenes")).toBe(true);
        expect(hasItalicWord("Duncker muscle fluke")).toBe(false);
    });
});

test.describe("titleProblems", () => {
    const right = [
        draw("Salmonella", ITALIC),
        draw(" ", UPRIGHT),
        draw("spp.", UPRIGHT),
    ];

    test("accepts a correctly set title", () => {
        expect(titleProblems(right, "Salmonella spp.")).toEqual([]);
    });

    test("fails an organism word drawn upright that should be italic", () => {
        const wrong = [
            draw("Salmonella", UPRIGHT),
            draw(" ", UPRIGHT),
            draw("spp.", UPRIGHT),
        ];
        expect(titleProblems(wrong, "Salmonella spp.")).toEqual([
            expect.stringContaining('"Salmonella" should be italic'),
        ]);
    });

    test("fails a word drawn italic that should be upright", () => {
        const wrong = [
            draw("Salmonella", ITALIC),
            draw(" ", UPRIGHT),
            draw("spp.", ITALIC),
        ];
        expect(titleProblems(wrong, "Salmonella spp.")).toEqual([
            expect.stringContaining('"spp." should be upright'),
        ]);
    });

    test("fails a title that names another organism", () => {
        expect(titleProblems(right, "Campylobacter spp.")).toEqual([
            expect.stringContaining("title reads"),
        ]);
    });

    test("ignores text drawn in other fonts", () => {
        const withTicks = [...right, draw("2020", "12px Arial")];
        expect(titleProblems(withTicks, "Salmonella spp.")).toEqual([]);
    });
});

test.describe("passes", () => {
    test("latestPass picks the last pass of the chosen canvas kind", () => {
        const draws = [
            draw("old", "12px Arial", 1),
            draw("new", "12px Arial", 2),
            draw("export", "12px Arial", 3, false),
        ];
        expect(latestPass(draws, true).map((d) => d.text)).toEqual(["new"]);
        expect(latestPass(draws, false).map((d) => d.text)).toEqual(["export"]);
        expect(latestPass([], true)).toEqual([]);
    });

    test("drawnYears keeps four-digit labels only", () => {
        const pass = [
            draw("2019", "12px Arial"),
            draw("5", "12px Arial"),
            draw("Fish-Fresh-Retail", "12px Arial"),
        ];
        expect(drawnYears(pass)).toEqual([2019]);
    });
});
