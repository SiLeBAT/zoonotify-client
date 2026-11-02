import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PrevalenceChart } from "../PrevalenceChart";
import { usePrevalenceFilters } from "../PrevalenceDataContext";

// Mock translations
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key) => key,
    }),
}));

// Mock PrevalenceDataContext
jest.mock("../PrevalenceDataContext", () => ({
    usePrevalenceFilters: jest.fn(),
}));

// Mock react-chartjs-2 to avoid canvas rendering in jsdom. The mock surfaces the
// two things the Chart year window controls — the visible years (data.labels) and
// the rescaled prevalence-% axis (options.scales.x.max) — plus the plotted
// combinations (one dataset each), so tests can observe them.
jest.mock("react-chartjs-2", () => ({
    Bar: ({ data, options }) => (
        <div
            data-testid="chart"
            data-labels={(data?.labels ?? []).join(",")}
            data-xmax={options?.scales?.x?.max}
            data-datasets={(data?.datasets ?? [])
                .map((dataset) => dataset.label)
                .join("|")}
        />
    ),
}));

describe("PrevalenceChart Component", () => {
    const mockPrevalenceData = [
        {
            microorganism: "E. Coli",
            sampleOrigin: "Sample Origin",
            matrix: "Matrix",
            samplingStage: "Stage",
            samplingYear: 2021,
            percentageOfPositive: 10,
            ciMin: 5,
            ciMax: 15,
            numberOfSamples: 100,
            numberOfPositive: 10,
        },
        {
            microorganism: "E. Coli",
            sampleOrigin: "Sample Origin",
            matrix: "Matrix",
            samplingStage: "Stage",
            samplingYear: 2022,
            percentageOfPositive: 20,
            ciMin: 10,
            ciMax: 25,
            numberOfSamples: 150,
            numberOfPositive: 20,
        },
    ];

    beforeEach(() => {
        usePrevalenceFilters.mockReturnValue({
            prevalenceData: mockPrevalenceData,
            loading: false,
            prevalenceUpdateDate: null,
            selectedYear: [],
            setSelectedYear: jest.fn(),
            yearOptions: [2021, 2022],
            selectedChartMicroorganism: "E. Coli",
            setSelectedChartMicroorganism: jest.fn(),
        });
    });

    it("renders without crashing", () => {
        render(<PrevalenceChart />);
        expect(
            screen.getByLabelText("Select_Microorganism")
        ).toBeInTheDocument();
    });

    it("displays loading indicator when loading is true", () => {
        usePrevalenceFilters.mockReturnValueOnce({
            prevalenceData: [],
            loading: true,
        });
        render(<PrevalenceChart />);
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("renders microorganism select component", () => {
        render(<PrevalenceChart />);
        expect(
            screen.getByLabelText("Select_Microorganism")
        ).toBeInTheDocument();
    });

    it("displays charts when data is available", () => {
        render(<PrevalenceChart />);
        expect(screen.getAllByTestId("chart")).toHaveLength(1); // Checks if the mocked chart is rendered
    });
});

describe("PrevalenceChart — Chart year window slider", () => {
    // Build context data for a single microorganism spanning the given years.
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const dataForYears = (years, micro = "E. Coli") =>
        years.map((year) => ({
            microorganism: micro,
            sampleOrigin: "Sample Origin",
            matrix: "Matrix",
            samplingStage: "Stage",
            samplingYear: year,
            percentageOfPositive: 10,
            ciMin: 5,
            ciMax: 15,
            numberOfSamples: 100,
            numberOfPositive: 10,
        }));

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const mockContext = (overrides = {}) =>
        usePrevalenceFilters.mockReturnValue({
            prevalenceData: dataForYears([2020, 2021, 2022]),
            loading: false,
            prevalenceUpdateDate: null,
            selectedYear: [],
            setSelectedYear: jest.fn(),
            yearOptions: [2020, 2021, 2022],
            selectedChartMicroorganism: "E. Coli",
            setSelectedChartMicroorganism: jest.fn(),
            ...overrides,
        });

    it("renders a range slider spanning the selected microorganism's full year span by default", () => {
        mockContext();
        render(<PrevalenceChart />);

        const thumbs = screen.getAllByRole("slider");
        expect(thumbs).toHaveLength(2);
        // Bounds are the micro's own min/max year
        expect(thumbs[0]).toHaveAttribute("aria-valuemin", "2020");
        expect(thumbs[0]).toHaveAttribute("aria-valuemax", "2022");
        // Default window is the full span
        expect(thumbs[0]).toHaveAttribute("aria-valuenow", "2020");
        expect(thumbs[1]).toHaveAttribute("aria-valuenow", "2022");
    });

    it("hides the slider when the microorganism has only one year of data", () => {
        mockContext({ prevalenceData: dataForYears([2022]) });
        render(<PrevalenceChart />);

        expect(screen.queryByRole("slider")).not.toBeInTheDocument();
    });

    it("shows a visible label describing what the slider does", () => {
        mockContext();
        render(<PrevalenceChart />);

        const label = screen.getByText("Chart_Year_Range");
        expect(label).toBeInTheDocument();
        // The label is wired to the slider for assistive tech.
        expect(screen.getAllByRole("slider")[0]).toHaveAccessibleName(
            "Chart_Year_Range"
        );
    });

    it("shows the thumb value balloons only on hover/drag", () => {
        mockContext();
        const { container } = render(<PrevalenceChart />);

        // Value balloons stay closed until the user interacts with a thumb.
        expect(
            container.querySelectorAll(".MuiSlider-valueLabelOpen")
        ).toHaveLength(0);
    });

    it("marks every year of the span on the slider rail", () => {
        mockContext();
        const { container } = render(<PrevalenceChart />);

        expect(container.querySelectorAll(".MuiSlider-mark")).toHaveLength(3);
        const markLabels = Array.from(
            container.querySelectorAll(".MuiSlider-markLabel")
        ).map((node) => node.textContent);
        expect(markLabels).toEqual(["2020", "2021", "2022"]);
    });

    it("thins the mark labels on a long span but keeps the bounds labelled", () => {
        const years = Array.from({ length: 24 }, (_, i) => 2000 + i);
        mockContext({
            prevalenceData: dataForYears(years),
            yearOptions: years,
        });
        const { container } = render(<PrevalenceChart />);

        // A tick per year, but far fewer labels.
        expect(container.querySelectorAll(".MuiSlider-mark")).toHaveLength(24);
        const markLabels = Array.from(
            container.querySelectorAll(".MuiSlider-markLabel")
        ).map((node) => node.textContent);
        expect(markLabels.length).toBeLessThanOrEqual(12);
        expect(markLabels[0]).toBe("2000");
        expect(markLabels[markLabels.length - 1]).toBe("2023");
    });

    it("drops years outside the window from the rendered charts", () => {
        mockContext();
        render(<PrevalenceChart />);

        // Full span initially: newest year first.
        expect(screen.getByTestId("chart")).toHaveAttribute(
            "data-labels",
            "2022,2021,2020"
        );

        // Move the upper thumb down one year (2022 -> 2021).
        const thumbs = screen.getAllByRole("slider");
        fireEvent.change(thumbs[1], { target: { value: "2021" } });

        expect(screen.getByTestId("chart")).toHaveAttribute(
            "data-labels",
            "2021,2020"
        );
    });

    it("rescales the prevalence-% axis to only the years in the window", () => {
        // 2022 has a wide confidence interval (>25%); the earlier years are low.
        const data = dataForYears([2020, 2021, 2022]).map((entry) =>
            entry.samplingYear === 2022 ? { ...entry, ciMax: 40 } : entry
        );
        mockContext({ prevalenceData: data });
        render(<PrevalenceChart />);

        // Full span includes the high-CI year -> wide axis.
        expect(screen.getByTestId("chart")).toHaveAttribute("data-xmax", "100");

        // Exclude 2022 -> all visible CIs are low -> axis tightens.
        const thumbs = screen.getAllByRole("slider");
        fireEvent.change(thumbs[1], { target: { value: "2021" } });

        expect(screen.getByTestId("chart")).toHaveAttribute("data-xmax", "25");
    });

    it("does not mutate shared filter state when the window changes (view-only)", () => {
        const setSelectedYear = jest.fn();
        const setSelectedChartMicroorganism = jest.fn();
        mockContext({ setSelectedYear, setSelectedChartMicroorganism });
        render(<PrevalenceChart />);

        const thumbs = screen.getAllByRole("slider");
        fireEvent.change(thumbs[1], { target: { value: "2021" } });

        expect(setSelectedYear).not.toHaveBeenCalled();
        expect(setSelectedChartMicroorganism).not.toHaveBeenCalled();
    });

    it("resets the window to full span when the microorganism changes", () => {
        const data = [
            ...dataForYears([2020, 2021, 2022], "E. Coli"),
            ...dataForYears([2023, 2024, 2025], "Salmonella"),
        ];
        mockContext({
            prevalenceData: data,
            selectedChartMicroorganism: "E. Coli",
        });
        const { rerender } = render(<PrevalenceChart />);

        // Narrow the E. Coli window.
        fireEvent.change(screen.getAllByRole("slider")[1], {
            target: { value: "2021" },
        });
        expect(screen.getAllByRole("slider")[1]).toHaveAttribute(
            "aria-valuenow",
            "2021"
        );

        // Switch microorganism -> window must snap back to the new micro's span.
        mockContext({
            prevalenceData: data,
            selectedChartMicroorganism: "Salmonella",
        });
        rerender(<PrevalenceChart />);

        const thumbs = screen.getAllByRole("slider");
        expect(thumbs[0]).toHaveAttribute("aria-valuemin", "2023");
        expect(thumbs[1]).toHaveAttribute("aria-valuemax", "2025");
        expect(thumbs[0]).toHaveAttribute("aria-valuenow", "2023");
        expect(thumbs[1]).toHaveAttribute("aria-valuenow", "2025");
    });
});

describe("PrevalenceChart — comparing combinations in one graph", () => {
    // One prevalence row per (combination, year) for E. Coli; a combination is
    // sample origin × matrix × sampling stage.
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const row = (sampleOrigin, samplingYear = 2022, extra = {}) => ({
        microorganism: "E. Coli",
        sampleOrigin,
        matrix: "Matrix",
        samplingStage: "Stage",
        samplingYear,
        percentageOfPositive: 10,
        ciMin: 5,
        ciMax: 15,
        numberOfSamples: 100,
        numberOfPositive: 10,
        ...extra,
    });

    const fiveCombinations = ["O1", "O2", "O3", "O4", "O5"].map((origin) =>
        row(origin)
    );

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const mockContext = (overrides = {}) =>
        usePrevalenceFilters.mockReturnValue({
            prevalenceData: fiveCombinations,
            loading: false,
            prevalenceUpdateDate: null,
            selectedChartMicroorganism: "E. Coli",
            setSelectedChartMicroorganism: jest.fn(),
            ...overrides,
        });

    it("plots the first four combinations together in a single graph by default", () => {
        mockContext();
        render(<PrevalenceChart />);

        const charts = screen.getAllByTestId("chart");
        expect(charts).toHaveLength(1);
        expect(charts[0]).toHaveAttribute(
            "data-datasets",
            "O1-Matrix-Stage|O2-Matrix-Stage|O3-Matrix-Stage|O4-Matrix-Stage"
        );
    });

    it("offers every combination in a filter above the graph and drops a deselected one from it", async () => {
        const user = userEvent.setup();
        mockContext();
        render(<PrevalenceChart />);

        await user.click(
            screen.getByRole("combobox", { name: "Combinations" })
        );
        const listbox = screen.getByRole("listbox");
        for (const origin of ["O1", "O2", "O3", "O4", "O5"]) {
            expect(
                within(listbox).getByRole("option", {
                    name: `${origin}-Matrix-Stage`,
                })
            ).toBeInTheDocument();
        }

        await user.click(
            within(listbox).getByRole("option", { name: "O2-Matrix-Stage" })
        );

        expect(screen.getByTestId("chart")).toHaveAttribute(
            "data-datasets",
            "O1-Matrix-Stage|O3-Matrix-Stage|O4-Matrix-Stage"
        );
    });

    it("refuses a fifth combination and explains the limit of four", async () => {
        const user = userEvent.setup();
        mockContext();
        render(<PrevalenceChart />);

        await user.click(
            screen.getByRole("combobox", { name: "Combinations" })
        );
        await user.click(
            screen.getByRole("option", { name: "O5-Matrix-Stage" })
        );

        expect(
            screen.getByRole("dialog", { name: "Combination_Limit_Title" })
        ).toHaveTextContent("Combination_Limit_Message");
        expect(screen.getByTestId("chart")).toHaveAttribute(
            "data-datasets",
            "O1-Matrix-Stage|O2-Matrix-Stage|O3-Matrix-Stage|O4-Matrix-Stage"
        );
    });

    it("toggles between deselecting all and selecting the first four when more than four exist", async () => {
        const user = userEvent.setup();
        mockContext();
        render(<PrevalenceChart />);

        await user.click(
            screen.getByRole("combobox", { name: "Combinations" })
        );
        await user.click(screen.getByRole("option", { name: "Deselect_All" }));
        expect(screen.getByTestId("chart")).toHaveAttribute(
            "data-datasets",
            ""
        );

        await user.click(
            screen.getByRole("option", { name: "Select_First_Four" })
        );
        expect(screen.getByTestId("chart")).toHaveAttribute(
            "data-datasets",
            "O1-Matrix-Stage|O2-Matrix-Stage|O3-Matrix-Stage|O4-Matrix-Stage"
        );
    });

    it("offers a plain select-all when no more than four combinations exist", async () => {
        const user = userEvent.setup();
        mockContext({ prevalenceData: ["O1", "O2", "O3"].map((o) => row(o)) });
        render(<PrevalenceChart />);

        await user.click(
            screen.getByRole("combobox", { name: "Combinations" })
        );
        await user.click(
            screen.getByRole("option", { name: "O2-Matrix-Stage" })
        );
        await user.click(screen.getByRole("option", { name: "Select_All" }));

        expect(screen.getByTestId("chart")).toHaveAttribute(
            "data-datasets",
            "O1-Matrix-Stage|O2-Matrix-Stage|O3-Matrix-Stage"
        );
    });

    it("resets to the new microorganism's first combinations when the microorganism changes", async () => {
        const user = userEvent.setup();
        const data = [
            ...fiveCombinations,
            ...["S1", "S2"].map((o) =>
                row(o, 2022, { microorganism: "Salmonella" })
            ),
        ];
        mockContext({ prevalenceData: data });
        const { rerender } = render(<PrevalenceChart />);

        await user.click(
            screen.getByRole("combobox", { name: "Combinations" })
        );
        await user.click(
            screen.getByRole("option", { name: "O2-Matrix-Stage" })
        );

        mockContext({
            prevalenceData: data,
            selectedChartMicroorganism: "Salmonella",
        });
        rerender(<PrevalenceChart />);

        expect(screen.getByTestId("chart")).toHaveAttribute(
            "data-datasets",
            "S1-Matrix-Stage|S2-Matrix-Stage"
        );
    });

    it("resets to the default combinations after a new search", async () => {
        const user = userEvent.setup();
        mockContext();
        const { rerender } = render(<PrevalenceChart />);

        await user.click(
            screen.getByRole("combobox", { name: "Combinations" })
        );
        await user.click(
            screen.getByRole("option", { name: "O2-Matrix-Stage" })
        );

        // A new search returns a different dataset for the same microorganism.
        mockContext({
            prevalenceData: ["O3", "O4", "O5"].map((o) => row(o, 2023)),
        });
        rerender(<PrevalenceChart />);

        expect(screen.getByTestId("chart")).toHaveAttribute(
            "data-datasets",
            "O3-Matrix-Stage|O4-Matrix-Stage|O5-Matrix-Stage"
        );
    });

    it("scales the prevalence-% axis to the plotted combinations only", () => {
        // O5 is not plotted by default; its wide CI must not widen the axis.
        mockContext({
            prevalenceData: [
                ...["O1", "O2", "O3", "O4"].map((o) => row(o)),
                row("O5", 2022, { ciMax: 40 }),
            ],
        });
        render(<PrevalenceChart />);

        expect(screen.getByTestId("chart")).toHaveAttribute("data-xmax", "25");
    });

    it("shows only the years that a plotted combination has data for", () => {
        // 2021 exists only for O5, which is not plotted by default.
        mockContext({
            prevalenceData: [
                row("O1", 2020),
                row("O1", 2022),
                ...["O2", "O3", "O4"].map((o) => row(o, 2022)),
                row("O5", 2021),
            ],
        });
        render(<PrevalenceChart />);

        expect(screen.getByTestId("chart")).toHaveAttribute(
            "data-labels",
            "2022,2020"
        );
    });
});
