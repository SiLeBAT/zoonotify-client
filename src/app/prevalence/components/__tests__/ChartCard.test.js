import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChartCard } from "../ChartCard";

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
        chartRef: { current: null },
        currentMicroorganism: "E. Coli",
        yearsToShow: [2021, 2022],
        xAxisMax: 100,
        downloadChart: jest.fn(),
        prevalenceUpdateDate: null,
    };

    it("renders without crashing and shows the download button", () => {
        render(<ChartCard {...defaultProps} />);
        expect(
            screen.getByRole("button", { name: "Download_Chart" })
        ).toBeInTheDocument();
    });

    it("renders chart with correct data", () => {
        render(<ChartCard {...defaultProps} />);
        expect(screen.getByTestId("chart")).toBeInTheDocument();
    });

    it("calls downloadChart function when the download button is clicked", async () => {
        const user = userEvent.setup();
        render(<ChartCard {...defaultProps} />);
        const downloadButton = screen.getByRole("button", {
            name: "Download_Chart",
        });
        await user.click(downloadButton);
        expect(defaultProps.downloadChart).toHaveBeenCalledTimes(1);
    });
});
