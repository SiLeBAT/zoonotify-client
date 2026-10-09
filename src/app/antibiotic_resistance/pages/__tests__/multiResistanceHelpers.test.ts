import LZString from "lz-string";
import {
    type MultiResistanceItem,
    buildMultiResistanceBars,
    decodeMultiResistanceState,
    encodeMultiResistanceState,
    toMultiResistanceCsv,
} from "../multiResistanceHelpers";
import { buildCombinationKey, emptyFilterState } from "../resistanceHelpers";

const rel = (
    id: number,
    name: string,
    documentId: string
): { id: number; name: string; documentId: string } => ({
    id,
    name,
    documentId,
});

/** One Resistance group row of an E. coli broiler-caecum Combination, N = 170. */
const groupRow = (
    resistanceGroup: number,
    anzahlIsolate: number,
    overrides: Partial<MultiResistanceItem> = {}
): MultiResistanceItem => ({
    id: resistanceGroup + 1,
    samplingYear: 2023,
    specie: null,
    superCategorySampleOrigin: rel(1, "Animal", "sco-animal"),
    sampleOrigin: rel(2, "Broiler", "so-broiler"),
    samplingStage: rel(3, "Slaughterhouse", "ss-slaughter"),
    matrixGroup: rel(4, "Caecal content", "mg-caecum"),
    matrix: rel(5, "Caecal content", "m-caecum"),
    matrixDetail: null,
    resistanceGroup,
    anzahlIsolate,
    anzahlGetesteterIsolate: 170,
    ...overrides,
});

describe("buildMultiResistanceBars", () => {
    it("splits an MRSA-scheme microorganism's bars into its ten groups, 5× … >8× instead of >4×", () => {
        const rows = [
            groupRow(0, 70),
            groupRow(1, 50),
            groupRow(6, 30),
            groupRow(10, 20),
        ];

        const { bars } = buildMultiResistanceBars(rows, "MRSA");

        expect(bars[0].groups.map((g) => g.rank)).toEqual([
            0, 1, 2, 3, 4, 6, 7, 8, 9, 10,
        ]);
        expect(bars[0].groups.map((g) => g.count)).toEqual([
            70, 50, 0, 0, 0, 30, 0, 0, 0, 20,
        ]);
    });

    it("keeps one scheme per microorganism: a Combination with only low groups still gets MRSA's ten", () => {
        const other = {
            samplingStage: rel(9, "Farm", "ss-farm"),
        };
        const rows = [
            groupRow(0, 100),
            groupRow(7, 70),
            groupRow(0, 150, other),
            groupRow(2, 20, other),
        ];

        const { bars } = buildMultiResistanceBars(rows, "MRSA");

        expect(bars.map((b) => b.groups.length)).toEqual([10, 10]);
    });

    it("gives each Resistance group its share of the Combination's tested isolates", () => {
        const rows = [
            groupRow(0, 85),
            groupRow(1, 17),
            groupRow(2, 40),
            groupRow(3, 17),
            groupRow(4, 8),
            groupRow(5, 3),
        ];

        const { bars } = buildMultiResistanceBars(rows, "E. coli");

        expect(bars).toHaveLength(1);
        expect(bars[0].n).toBe(170);
        expect(bars[0].groups.map((g) => g.count)).toEqual([
            85, 17, 40, 17, 8, 3,
        ]);
        expect(bars[0].groups[2].proportion).toBeCloseTo(40 / 170);
        expect(
            bars[0].groups.reduce((sum, g) => sum + g.proportion, 0)
        ).toBeCloseTo(1);
    });

    it("counts a Resistance group missing from the data as zero isolates", () => {
        const rows = [groupRow(0, 150), groupRow(2, 20)];

        const { bars } = buildMultiResistanceBars(rows, "E. coli");

        expect(bars[0].groups).toHaveLength(6);
        expect(bars[0].groups.map((g) => g.count)).toEqual([
            150, 0, 20, 0, 0, 0,
        ]);
        expect(bars[0].groups[1].proportion).toBe(0);
    });

    it("plots no bar for a Combination under 10 tested isolates, but reports it", () => {
        const small = {
            anzahlGetesteterIsolate: 9,
            matrix: rel(7, "Meat", "m-meat"),
        };
        const rows = [
            groupRow(0, 150),
            groupRow(1, 20),
            groupRow(0, 6, small),
            groupRow(1, 3, small),
        ];

        const { bars, belowMinimum } = buildMultiResistanceBars(
            rows,
            "E. coli"
        );

        expect(bars.map((b) => b.n)).toEqual([170]);
        expect(belowMinimum.map((b) => b.n)).toEqual([9]);
    });

    it("keys a bar exactly like the Substance Graph's Combination, ignoring matrix detail", () => {
        const row = groupRow(0, 170, {
            matrixDetail: rel(8, "fresh", "md-fresh"),
        });

        const { bars } = buildMultiResistanceBars([row], "E. coli");

        expect(bars[0].key).toBe(buildCombinationKey(row, "E. coli"));
    });

    it.each(["Campylobacter spp.", "Enterococcus spp."])(
        "splits %s bars by species",
        (microorganism) => {
            const rows = [
                groupRow(0, 170, { specie: rel(10, "jejuni", "sp-jejuni") }),
                groupRow(0, 170, { specie: rel(11, "coli", "sp-coli") }),
            ];

            const { bars } = buildMultiResistanceBars(rows, microorganism);

            expect(bars).toHaveLength(2);
        }
    );

    it("does not split by species for microorganisms without one", () => {
        const rows = [
            groupRow(0, 100, { specie: rel(10, "a", "sp-a") }),
            groupRow(1, 70, { specie: rel(11, "b", "sp-b") }),
        ];

        const { bars } = buildMultiResistanceBars(rows, "E. coli");

        expect(bars).toHaveLength(1);
    });

    it("labels a bar Matrix – Sample origin – Sampling stage (N = …)", () => {
        const { bars } = buildMultiResistanceBars(
            [groupRow(0, 170)],
            "E. coli"
        );

        expect(bars[0].label).toBe(
            "Caecal content – Broiler – Slaughterhouse (N = 170)"
        );
    });

    it("leaves matrix detail out of the label", () => {
        const { bars } = buildMultiResistanceBars(
            [groupRow(0, 170, { matrixDetail: rel(8, "fresh", "md-fresh") })],
            "E. coli"
        );

        expect(bars[0].label).toBe(
            "Caecal content – Broiler – Slaughterhouse (N = 170)"
        );
    });

    it("leads the label with the species where the key has one", () => {
        const { bars } = buildMultiResistanceBars(
            [groupRow(0, 170, { specie: rel(10, "C. jejuni", "sp-jejuni") })],
            "Campylobacter spp."
        );

        expect(bars[0].label).toBe(
            "C. jejuni – Caecal content – Broiler – Slaughterhouse (N = 170)"
        );
    });
});

describe("toMultiResistanceCsv", () => {
    const headers = ["Combination", "Group", "Isolates", "N", "%"];
    const groupLabels = ["susceptible", "1x", "2x", "3x", "4x", ">4x"];
    const { bars } = buildMultiResistanceBars(
        [groupRow(0, 130), groupRow(2, 40)],
        "E. coli"
    );

    it("writes one row per Combination and Resistance group, with count, N and percent", () => {
        const csv = toMultiResistanceCsv(bars, {
            sep: ",",
            decimalSep: ".",
            headers,
            groupLabels,
        });

        const lines = csv.split("\n");
        expect(lines).toHaveLength(1 + 6);
        expect(lines[0]).toBe("Combination,Group,Isolates,N,%");
        expect(lines[3]).toBe(
            "Caecal content – Broiler – Slaughterhouse (N = 170),2x,40,170,23.5"
        );
        expect(lines[2]).toBe(
            "Caecal content – Broiler – Slaughterhouse (N = 170),1x,0,170,0.0"
        );
    });

    it("uses a decimal comma and quotes fields that contain the separator", () => {
        const csv = toMultiResistanceCsv(bars, {
            sep: ";",
            decimalSep: ",",
            headers,
            groupLabels: ["sensibel; alle", ...groupLabels.slice(1)],
        });

        expect(csv.split("\n")[1]).toBe(
            'Caecal content – Broiler – Slaughterhouse (N = 170);"sensibel; alle";130;170;76,5'
        );
    });
});

describe("Multi-resistance share link", () => {
    const rows = [groupRow(0, 130), groupRow(2, 40)];
    const state = {
        microorganism: "E. coli",
        lang: "de",
        selected: {
            ...emptyFilterState,
            sampleOrigin: ["so-broiler"],
            matrix: ["m-caecum"],
        },
        year: 2023,
        combinations: [buildMultiResistanceBars(rows, "E. coli").bars[0].key],
    };

    it("round-trips filters, year and Combinations through ?s=", () => {
        const s = encodeMultiResistanceState(state, rows);

        expect(decodeMultiResistanceState(s, rows)).toEqual(state);
    });

    it("marks the link as the Multi-resistance view", () => {
        const s = encodeMultiResistanceState(state, rows);

        expect(
            JSON.parse(LZString.decompressFromEncodedURIComponent(s) ?? "")
        ).toMatchObject({ m: "E. coli", v: "multi" });
    });

    it("resolves filters by name, so a link survives re-imported documentIds", () => {
        const s = encodeMultiResistanceState(state, rows);
        const reimported = rows.map((r) => ({
            ...r,
            sampleOrigin: rel(2, "Broiler", "so-broiler-v2"),
        }));

        expect(
            decodeMultiResistanceState(s, reimported)?.selected.sampleOrigin
        ).toEqual(["so-broiler-v2"]);
    });

    it("rejects a garbled link", () => {
        expect(decodeMultiResistanceState("garbage", rows)).toBeNull();
    });
});
