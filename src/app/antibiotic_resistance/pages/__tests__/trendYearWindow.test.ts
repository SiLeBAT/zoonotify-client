import {
    chartYearAxis,
    distinctYears,
    yearSliderMarks,
} from "../trendYearWindow";

describe("distinctYears", () => {
    it("returns each finite year once, ascending", () => {
        expect(
            distinctYears([
                { samplingYear: 2021 },
                { samplingYear: 2019 },
                { samplingYear: 2021 },
                { samplingYear: NaN },
            ])
        ).toEqual([2019, 2021]);
    });
});

describe("chartYearAxis", () => {
    it("spans the chart's own data years when no window is set", () => {
        expect(chartYearAxis([2018, 2021])).toEqual([2018, 2019, 2020, 2021]);
    });

    it("narrows to the window", () => {
        expect(chartYearAxis([2015, 2021], [2019, 2020])).toEqual([2019, 2020]);
    });

    it("extends past the chart's own data so charts share one axis", () => {
        expect(chartYearAxis([2020, 2021], [2018, 2021])).toEqual([
            2018, 2019, 2020, 2021,
        ]);
    });

    it("is empty without data or window", () => {
        expect(chartYearAxis([])).toEqual([]);
    });
});

describe("yearSliderMarks", () => {
    it("has no marks for fewer than two years", () => {
        expect(yearSliderMarks([2021])).toEqual([]);
    });

    it("labels every year on short spans", () => {
        expect(yearSliderMarks([2019, 2020, 2021])).toEqual([
            { value: 2019, label: "2019" },
            { value: 2020, label: "2020" },
            { value: 2021, label: "2021" },
        ]);
    });

    it("thins labels on long spans but always labels both ends", () => {
        const years = Array.from({ length: 25 }, (_, i) => 2000 + i);
        const marks = yearSliderMarks(years);
        expect(marks).toHaveLength(25);
        expect(marks[0].label).toBe("2000");
        expect(marks[24].label).toBe("2024");
        expect(marks.filter((m) => m.label).length).toBeLessThanOrEqual(10);
    });
});
