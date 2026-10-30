import { EverydayWord } from "../model";
import { snapshotOfficialNames } from "../__fixtures__/snapshot";
import { checkEverydayWords } from "../wordList";

// The offline half of the stale-word check; the live half runs in CI (`npm run check:stale-words`).
describe("stale everyday words", () => {
    it("names the everyday word and the value it points at when that value is gone", () => {
        const stale: EverydayWord = {
            id: "animal-dodo",
            category: "food and animals",
            en: ["dodo bird"],
            de: ["Dronte"],
            sets: { specie: ["Dodo"] },
        };

        const errors = checkEverydayWords(snapshotOfficialNames, [stale]);

        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain("animal-dodo");
        expect(errors[0]).toContain("dodo bird");
        expect(errors[0]).toContain('"Dodo"');
    });

    it("names a substance code that no longer exists", () => {
        const stale: EverydayWord = {
            id: "sub-gone",
            category: "substances",
            en: ["gonemycin"],
            de: [],
            sets: { antimicrobialSubstance: ["XYZ"] },
        };

        const [error] = checkEverydayWords(snapshotOfficialNames, [stale]);

        expect(error).toContain("gonemycin");
        expect(error).toContain('"XYZ"');
    });
});
