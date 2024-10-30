import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PrevalenceChart } from "./PrevalenceChart";
import { usePrevalenceFilters } from "./PrevalenceDataContext";
import { useTranslation } from "react-i18next";

// Mock translations
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key) => key,
    }),
}));

// Mock PrevalenceDataContext
jest.mock("./PrevalenceDataContext", () => ({
    usePrevalenceFilters: jest.fn(),
}));

// Mock react-chartjs-2 to avoid ref errors and chart rendering issues
jest.mock("react-chartjs-2", () => ({
    Bar: () => <div data-testid="chart" />,
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
        });
    });

    it("renders without crashing", () => {
        render(<PrevalenceChart />);
        expect(screen.getByText("Download_All_Charts")).toBeInTheDocument();
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
