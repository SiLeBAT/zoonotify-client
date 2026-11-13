import { buildSerovarChart, OTHER_SEROVARS } from "../serovarChart";
import type { TypingResult } from "../typingData";

function row(
    origin: string,
    matrix: string,
    stage: string,
    n: number,
    serovar: string,
    isolates: number,
    samplingYear = 2022
): TypingResult {
    return {
        samplingYear,
        numberOfIsolates: n,
        numberOfIsolatesInSubgroup: isolates,
        sampleOrigin: { name: origin },
        matrix: { name: matrix },
        samplingStage: { name: stage },
        typingSubgroup: { name: serovar },
    };
}

describe("buildSerovarChart", () => {
    it("gives each serovar its percentage share of a combination's isolates", () => {
        const chart = buildSerovarChart(
            [
                row(
                    "Laying hens",
                    "Faeces/dust",
                    "Farm",
                    20,
                    "S. Enteritidis",
                    15
                ),
                row("Laying hens", "Faeces/dust", "Farm", 20, "S. Infantis", 5),
            ],
            2022
        );

        expect(chart.bars).toHaveLength(1);
        expect(chart.bars[0]).toMatchObject({
            sampleOrigin: "Laying hens",
            matrix: "Faeces/dust",
            samplingStage: "Farm",
            n: 20,
            shares: { "S. Enteritidis": 75, "S. Infantis": 25 },
        });
        expect(chart.serovars).toEqual(["S. Enteritidis", "S. Infantis"]);
    });

    it("plots only the chosen sampling year", () => {
        const chart = buildSerovarChart(
            [
                row(
                    "Laying hens",
                    "Faeces/dust",
                    "Farm",
                    20,
                    "S. Enteritidis",
                    20,
                    2021
                ),
                row(
                    "Broilers",
                    "Fresh meat",
                    "Retail",
                    26,
                    "S. Infantis",
                    26,
                    2022
                ),
            ],
            2021
        );

        expect(chart.bars.map((b) => b.sampleOrigin)).toEqual(["Laying hens"]);
        expect(chart.serovars).toEqual(["S. Enteritidis"]);
    });

    it("leaves out combinations with fewer than 10 isolates", () => {
        const chart = buildSerovarChart(
            [
                row("Broilers", "Fresh meat", "Retail", 10, "S. Infantis", 10),
                row(
                    "Broilers",
                    "Fresh meat",
                    "Border control posts",
                    9,
                    "S. Indiana",
                    9
                ),
            ],
            2022
        );

        expect(chart.bars.map((b) => b.samplingStage)).toEqual(["Retail"]);
        expect(chart.serovars).toEqual(["S. Infantis"]);
    });

    it("keeps the ten most frequent serovars and lumps the rest into other serovars", () => {
        // Ten serovars with 20 … 11 isolates, then two with 5 each: N = 165.
        const top = Array.from({ length: 10 }, (_, i) => ({
            serovar: `S. Top${i + 1}`,
            isolates: 20 - i,
        }));
        const rare = [
            { serovar: "S. Rare A", isolates: 5 },
            { serovar: "S. Rare B", isolates: 5 },
        ];
        const chart = buildSerovarChart(
            [...rare, ...top].map(({ serovar, isolates }) =>
                row("Broilers", "Faeces/dust", "Farm", 165, serovar, isolates)
            ),
            2022
        );

        expect(chart.serovars).toEqual([
            "S. Top1",
            "S. Top2",
            "S. Top3",
            "S. Top4",
            "S. Top5",
            "S. Top6",
            "S. Top7",
            "S. Top8",
            "S. Top9",
            "S. Top10",
            OTHER_SEROVARS,
        ]);
        const { shares } = chart.bars[0];
        expect(shares[OTHER_SEROVARS]).toBeCloseTo(6.06, 2);
        expect(shares["S. Rare A"]).toBeUndefined();
        expect(shares["S. Top1"]).toBeCloseTo(12.12, 2);
    });
});
