import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    within,
} from "@testing-library/react";
import { TrendDetails } from "../TrendDetails";
import { callApiService } from "../../../shared/infrastructure/api/callApi.service";
import type { ResistanceApiItem } from "../resistanceHelpers";

jest.mock("../../../shared/infrastructure/api/callApi.service", () => ({
    callApiService: jest.fn(),
}));

jest.mock("../../../shared/components/layout/SidebarComponent", () => ({
    SidebarComponent: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
}));

jest.mock("../TrendChart", () => ({
    TrendChart: () => <div data-testid="trend-chart" />,
}));

// Pulled in only for the heading; the real module drags in PageLayoutComponent,
// whose emotion jsx pragma the babel test config rejects.
jest.mock("../AntibioticResistancePage.component", () => ({
    FormattedMicroorganismName: ({ microName }: { microName: string }) => (
        <span>{microName}</span>
    ),
}));

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en", changeLanguage: jest.fn() },
    }),
}));

jest.mock("i18next", () => ({
    __esModule: true,
    default: { language: "en" },
}));

const MICROORGANISM = "E. coli";
const SUBSTANCE_LABEL = "ANTIBIOTIC_SUBSTANCE";

const SUBSTANCES = [
    { id: 1, name: "Ampicillin", documentId: "sub-ampicillin" },
    { id: 2, name: "Ciprofloxacin", documentId: "sub-ciprofloxacin" },
    { id: 3, name: "Tetracyclin", documentId: "sub-tetracyclin" },
];

const ROWS: ResistanceApiItem[] = SUBSTANCES.map((substance, index) => ({
    id: index + 1,
    samplingYear: 2021,
    superCategorySampleOrigin: null,
    sampleOrigin: { id: 1, name: "Tier", documentId: "origin-tier" },
    samplingStage: null,
    matrixGroup: null,
    matrix: null,
    antimicrobialSubstance: substance,
    specie: null,
    resistenzrate: 10 + index,
    anzahlGetesteterIsolate: 100,
    anzahlResistenterIsolate: 10 + index,
    minKonfidenzintervall: 1,
    maxKonfidenzintervall: 20,
})) as ResistanceApiItem[];

const mockedCallApiService = callApiService as jest.MockedFunction<
    typeof callApiService
>;

function substanceCombobox(): HTMLElement {
    const label = Array.from(document.querySelectorAll("label")).find(
        (candidate) => candidate.textContent === SUBSTANCE_LABEL
    );
    if (!label) throw new Error("substance filter label not found");

    const formControl = label.closest(".MuiFormControl-root");
    return within(formControl as HTMLElement).getByRole("combobox");
}

function substanceOptions(): HTMLElement[] {
    return within(screen.getByRole("listbox")).getAllByRole("option");
}

async function renderTrendDetails(): Promise<void> {
    window.history.replaceState(null, "", "/");
    render(<TrendDetails microorganism={MICROORGANISM} />);

    // every substance is selected by default once the fetch settles
    await waitFor(() =>
        expect(substanceCombobox()).toHaveTextContent("Tetracyclin")
    );
}

beforeAll(() => {
    window.scrollTo = jest.fn();
});

beforeEach(() => {
    mockedCallApiService.mockReset();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedCallApiService.mockImplementation((url: string): Promise<any> => {
        if (url.includes("resistance")) {
            return Promise.resolve({ data: { data: ROWS } });
        }
        return Promise.resolve({ data: { data: [] } });
    });
});

describe("TrendDetails substance filter", () => {
    it("focuses the first option so the list opens at the top, not the bottom", async () => {
        await renderTrendDetails();

        fireEvent.mouseDown(substanceCombobox());

        const options = substanceOptions();
        expect(options[0]).toHaveFocus();
        expect(options[options.length - 1]).not.toHaveFocus();
    });

    it("clears every substance when Deselect All is clicked", async () => {
        await renderTrendDetails();

        fireEvent.mouseDown(substanceCombobox());
        expect(substanceOptions()[0]).toHaveTextContent("DESELECT_ALL");

        fireEvent.click(substanceOptions()[0]);

        substanceOptions()
            .slice(1)
            .forEach((option) =>
                expect(within(option).getByRole("checkbox")).not.toBeChecked()
            );
        expect(substanceOptions()[0]).toHaveTextContent("SELECT_ALL");
    });
});
