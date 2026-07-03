import React from "react";
import {
    render,
    screen,
    fireEvent,
    within,
    waitFor,
    act,
} from "@testing-library/react";
import { PrevalenceDataGrid } from "../PrevalenceDataGrid";
import { usePrevalenceFilters } from "../PrevalenceDataContext";

// --- jsdom polyfills the MUI DataGrid needs to render -------------------------
// DataGrid measures its container via ResizeObserver and reads client sizes to
// decide how many columns/rows to render. jsdom reports 0 for both, so without
// these it renders no column headers (and therefore no column menu).
beforeAll(() => {
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
        observe: () => {},
        unobserve: () => {},
        disconnect: () => {},
    }));
    Object.defineProperty(window.HTMLElement.prototype, "clientWidth", {
        configurable: true,
        value: 1000,
    });
    Object.defineProperty(window.HTMLElement.prototype, "clientHeight", {
        configurable: true,
        value: 600,
    });
    window.matchMedia =
        window.matchMedia ||
        function () {
            return {
                matches: false,
                addEventListener: () => {},
                removeEventListener: () => {},
                addListener: () => {},
                removeListener: () => {},
            };
        };
});

// Translations: return the key so we can assert which localeText slot is wired.
jest.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

// Focus the test on the grid: stub the sibling accordions.
jest.mock("../DataGridControls", () => ({
    DataGridControls: () => <div data-testid="controls" />,
}));
jest.mock("../PrevalenceChart", () => ({
    PrevalenceChart: () => <div data-testid="chart" />,
}));

// The grid's info useEffect calls the API on mount; keep it inert.
jest.mock("../../../shared/infrastructure/api/callApi.service", () => ({
    callApiService: jest.fn().mockResolvedValue({ data: { data: null } }),
}));

jest.mock("../PrevalenceDataContext", () => ({
    usePrevalenceFilters: jest.fn(),
}));

const rows = [
    {
        id: 1,
        samplingYear: 2021,
        microorganism: "Salmonella",
        sampleOrigin: "Chicken",
        superCategorySampleOrigin: "Poultry",
        samplingStage: "Farm",
        matrix: "Feces",
        numberOfSamples: 100,
        numberOfPositive: 10,
        percentageOfPositive: 10,
        ciMin: 5,
        ciMax: 15,
    },
    {
        id: 2,
        samplingYear: 2022,
        microorganism: "Campylobacter",
        sampleOrigin: "Cattle",
        superCategorySampleOrigin: "Bovine",
        samplingStage: "Slaughter",
        matrix: "Meat",
        numberOfSamples: 200,
        numberOfPositive: 20,
        percentageOfPositive: 10,
        ciMin: 5,
        ciMax: 15,
    },
];

beforeEach(() => {
    usePrevalenceFilters.mockReturnValue({
        searchParameters: {},
        prevalenceUpdateDate: "2024-01-01",
        selectedChartMicroorganism: "",
        isSearchTriggered: true,
    });
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const renderGrid = async () => {
    const utils = render(
        <PrevalenceDataGrid
            prevalenceData={rows}
            loading={false}
            language="en"
        />
    );
    // Flush the prevalence-info fetch so its state update stays inside act().
    await act(async () => {});
    return utils;
};

describe("PrevalenceDataGrid column menu", () => {
    it("offers a Filter option in a column's menu", async () => {
        await renderGrid();

        // Open the first column header's options menu ("⋮").
        const menuButtons = document.querySelectorAll(
            ".MuiDataGrid-menuIconButton"
        );
        expect(menuButtons.length).toBeGreaterThan(0);
        fireEvent.click(menuButtons[0]);

        const menu = screen.getByRole("menu");
        expect(
            within(menu).getByText("dataGridcolumnMenuFilter")
        ).toBeInTheDocument();
    });

    it("narrows the visible rows when a column filter is applied", async () => {
        await renderGrid();

        // Both microorganisms are visible before filtering.
        expect(screen.getByText("Salmonella")).toBeInTheDocument();
        expect(screen.getByText("Campylobacter")).toBeInTheDocument();

        // Open the microorganism column's menu (2nd column) and pick Filter.
        const menuButtons = document.querySelectorAll(
            ".MuiDataGrid-menuIconButton"
        );
        fireEvent.click(menuButtons[1]);
        fireEvent.click(screen.getByText("dataGridcolumnMenuFilter"));

        // Type a value into the filter panel's value input.
        const filterForm = document.querySelector(".MuiDataGrid-filterForm");
        const valueInput = within(filterForm).getAllByRole("textbox").pop();
        fireEvent.change(valueInput, { target: { value: "Salm" } });

        // The grid debounces before applying the filter model.
        await waitFor(() =>
            expect(screen.queryByText("Campylobacter")).not.toBeInTheDocument()
        );
        expect(screen.getByText("Salmonella")).toBeInTheDocument();
    });

    it("renders the filter panel with localized labels", async () => {
        await renderGrid();

        const menuButtons = document.querySelectorAll(
            ".MuiDataGrid-menuIconButton"
        );
        fireEvent.click(menuButtons[1]);
        fireEvent.click(screen.getByText("dataGridcolumnMenuFilter"));

        const filterForm = document.querySelector(".MuiDataGrid-filterForm");
        // Labels come from our translation keys, not MUI's English defaults.
        expect(
            within(filterForm).getByText("dataGridfilterPanelColumns")
        ).toBeInTheDocument();
        expect(
            within(filterForm).getByText("dataGridfilterPanelOperator")
        ).toBeInTheDocument();
        expect(
            within(filterForm).getByLabelText("dataGridfilterPanelInputLabel")
        ).toBeInTheDocument();
    });
});
