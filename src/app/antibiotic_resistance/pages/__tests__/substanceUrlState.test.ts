import LZString from "lz-string";
import {
    decodeSubstanceState,
    encodeSubstanceState,
} from "../substanceUrlState";
import { emptyFilterState } from "../resistanceHelpers";

describe("Substance graph ?s= state", () => {
    it.each(["en", "de"])(
        "round-trips organism, filters, year, combinations and l=%s",
        (lang) => {
            const s = encodeSubstanceState(
                {
                    microorganism: "Salmonella spp.",
                    selected: {
                        ...emptyFilterState,
                        specie: ["Masthähnchen"],
                        matrix: ["Blinddarminhalt"],
                    },
                    substanceFilter: ["Ciprofloxacin"],
                    chartYear: 2021,
                    combinations: ["a|b"],
                },
                lang
            );

            expect(decodeSubstanceState(s)).toEqual({
                microorganism: "Salmonella spp.",
                lang,
                selected: {
                    ...emptyFilterState,
                    specie: ["Masthähnchen"],
                    matrix: ["Blinddarminhalt"],
                    antimicrobialSubstance: ["Ciprofloxacin"],
                },
                substanceFilter: ["Ciprofloxacin"],
                chartYear: 2021,
                combinations: ["a|b"],
            });
        }
    );

    it("encodes the payload shape the AMR page reads (v=substance, short keys)", () => {
        const s = encodeSubstanceState(
            {
                microorganism: "E. coli",
                selected: { specie: ["Cattle"] },
                substanceFilter: [],
            },
            "en"
        );
        // Independent decoding with lz-string, not the module's decoder.
        expect(
            JSON.parse(LZString.decompressFromEncodedURIComponent(s))
        ).toEqual({
            m: "E. coli",
            v: "substance",
            l: "en",
            f: { s: ["Cattle"] },
        });
    });

    it("returns null for a missing or corrupt param", () => {
        expect(decodeSubstanceState(null)).toBeNull();
        expect(decodeSubstanceState("not-lz")).toBeNull();
    });
});
