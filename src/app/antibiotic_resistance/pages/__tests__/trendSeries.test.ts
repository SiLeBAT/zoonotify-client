import { substancesWithTrend } from "../trendSeries";

const row = (
    antimicrobialSubstance: string,
    samplingYear: number,
    anzahlGetesteterIsolate?: number
): {
    antimicrobialSubstance: string;
    samplingYear: number;
    anzahlGetesteterIsolate?: number;
} => ({ antimicrobialSubstance, samplingYear, anzahlGetesteterIsolate });

describe("substancesWithTrend", () => {
    it("keeps a substance plotted in two or more years", () => {
        expect(
            substancesWithTrend(
                [row("CIP", 2019, 50), row("CIP", 2021, 40)],
                [2019, 2020, 2021]
            )
        ).toEqual(new Set(["CIP"]));
    });

    it("drops a substance with data for only one year", () => {
        expect(
            substancesWithTrend(
                [
                    row("CIP", 2019, 50),
                    row("CIP", 2020, 50),
                    row("KAN", 2020, 50),
                ],
                [2019, 2020]
            )
        ).toEqual(new Set(["CIP"]));
    });

    it("drops a substance whose years all have fewer than 10 isolates", () => {
        expect(
            substancesWithTrend(
                [
                    row("CIP", 2019, 50),
                    row("CIP", 2020, 50),
                    row("FOX", 2019, 9),
                    row("FOX", 2020),
                ],
                [2019, 2020]
            )
        ).toEqual(new Set(["CIP"]));
    });

    it("counts only one year when the second has fewer than 10 isolates", () => {
        expect(
            substancesWithTrend(
                [row("STR", 2019, 50), row("STR", 2020, 9)],
                [2019, 2020]
            )
        ).toEqual(new Set());
    });

    it("counts only the years on the chart's axis", () => {
        expect(
            substancesWithTrend(
                [row("CIP", 2015, 50), row("CIP", 2020, 50)],
                [2019, 2020]
            )
        ).toEqual(new Set());
    });
});
