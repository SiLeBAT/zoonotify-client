// A resistance question that names no organism asks which organism is meant (held-out miss D3).
import { createLinkFinder } from "..";
import {
    newestYearInSnapshot,
    snapshotIndex,
    snapshotOfficialNames,
} from "../__fixtures__/snapshot";

const MRSA = "Methicillin-resistant Staphylococcus aureus (MRSA)";
/** Organisms the AMR page offers with chicken resistance data in the snapshot, in sidebar order. */
const CHICKEN_AMR = [
    "E. coli",
    "Campylobacter spp.",
    "Salmonella spp.",
    MRSA,
    "Enterococcus spp.",
];

const finder = createLinkFinder(() => Promise.resolve(snapshotOfficialNames));

describe("Link Finder: choose an organism", () => {
    it("asks which organism for a German resistance question naming none, offering only organisms with data", async () => {
        const result = await finder.find(
            "Sind die Antibiotikaresistenzen bei Hühnern in den letzten Jahren gesunken?",
            "de",
            snapshotIndex
        );

        expect(result.links).toEqual([]);
        expect(result.chooseOrganism?.map((c) => c.organism)).toEqual(
            CHICKEN_AMR
        );
        expect(result.chooseOrganism?.find((c) => c.organism === MRSA)).toEqual(
            {
                organism: MRSA,
                label: "Methicillin-resistente Staphylococcus aureus (MRSA)",
            }
        );
    });

    it("asks the same for the English equivalent, labelled in English", async () => {
        const result = await finder.find(
            "Has antibiotic resistance in chickens gone down in recent years?",
            "en",
            snapshotIndex
        );

        expect(result.links).toEqual([]);
        expect(result.chooseOrganism).toEqual(
            CHICKEN_AMR.map((organism) => ({ organism, label: organism }))
        );
    });

    it("re-runs with the chosen organism and returns checked resistance links", async () => {
        const result = await finder.find(
            "Sind die Antibiotikaresistenzen bei Hühnern in den letzten Jahren gesunken?",
            "de",
            snapshotIndex,
            "Campylobacter spp."
        );

        expect(result.chooseOrganism).toBeUndefined();
        expect(result.links.length).toBeGreaterThan(0);
        for (const link of result.links) {
            expect(link.page).toBe("amr");
            expect(link.filters).toMatchObject({
                microorganism: ["Campylobacter spp."],
                superCategorySampleOrigin: ["Chicken"],
            });
            expect(newestYearInSnapshot(link)).toBeDefined();
        }
    });

    it("leaves resistance questions that name an organism as they were", async () => {
        const result = await finder.find(
            "MRSA Resistenz Huhn",
            "de",
            snapshotIndex
        );

        expect(result.chooseOrganism).toBeUndefined();
        expect(result.links[0].filters.microorganism).toEqual([MRSA]);
    });
});
