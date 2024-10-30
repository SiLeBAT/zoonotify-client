import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChartCard } from "./ChartCard";
import { useTranslation } from "react-i18next";

// Mock translations
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key) => key,
    }),
}));

// Mock react-chartjs-2 to avoid chart rendering issues and ref warning
jest.mock("react-chartjs-2", () => ({
    Bar: () => <div data-testid="chart" />, // Mocked chart component
}));

describe("ChartCard Component", () => {
    const defaultProps = {
        chartKey: "Test Key",
        chartData: {
            2021: {
                x: 10,
                y: 2021,
                ciMin: 5,
                ciMax: 15,
                numberOfSamples: 100,
                numberOfPositive: 20,
            },
            2022: {
                x: 15,
                y: 2022,
                ciMin: 10,
                ciMax: 20,
                numberOfSamples: 120,
                numberOfPositive: 25,
            },
        },
        // Remove chartRef from the props as it is not used in these tests
        currentMicroorganism: "E. Coli",
        yearOptions: [2021, 2022],
        xAxisMax: 100,
        downloadChart: jest.fn(),
    };

    it("renders without crashing and displays the microorganism name", () => {
        render(<ChartCard {...defaultProps} />);
        // Locate the heading by role and check its content
        expect(screen.getByRole("heading", { level: 5 })).toHaveTextContent(
            "E. Coli"
        );
    });

    it("renders chart with correct data", () => {
        render(<ChartCard {...defaultProps} />);
        expect(screen.getByTestId("chart")).toBeInTheDocument();
    });

    it("calls downloadChart function when the download button is clicked", () => {
        render(<ChartCard {...defaultProps} />);
        const downloadButton = screen.getByRole("button", {
            name: "Download_Chart",
        });
        fireEvent.click(downloadButton);
        expect(defaultProps.downloadChart).toHaveBeenCalledTimes(1);
    });
});
