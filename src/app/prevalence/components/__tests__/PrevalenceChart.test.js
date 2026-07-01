import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
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
// the rescaled prevalence-% axis (options.scales.x.max) — so tests can observe them.
jest.mock("react-chartjs-2", () => ({
    Bar: ({ data, options }) => (
        <div
            data-testid="chart"
            data-labels={(data?.labels ?? []).join(",")}
            data-xmax={options?.scales?.x?.max}
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
