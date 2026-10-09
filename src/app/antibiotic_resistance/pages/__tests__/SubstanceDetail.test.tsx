import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { SubstanceDetail } from "../SubstanceDetail";
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

// Importing the real module drags in PageLayoutComponent, whose emotion jsx
// pragma the babel test config rejects. getGroupKey only labels combinations,
// so a stand-in is enough here.
jest.mock("../SubstanceChart", () => ({
    SubstanceChart: () => <div data-testid="substance-chart" />,
    getGroupKey: (row: { sampleOrigin?: { name: string } | null }) =>
        row.sampleOrigin?.name ?? "group",
}));

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en", changeLanguage: jest.fn() },
    }),
}));

const MICROORGANISM = "E. coli";
const SUBSTANCE_LABEL = "ANTIBIOTIC_SUBSTANCE";

/** Three substances, so "first" and "last" option are unambiguous. */
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

/** The substance dropdown, located via its floating label. */
function substanceCombobox(): HTMLElement {
    const label = Array.from(document.querySelectorAll("label")).find(
        (candidate) => candidate.textContent === SUBSTANCE_LABEL
    );
    if (!label) throw new Error("substance filter label not found");

    const formControl = label.closest(".MuiFormControl-root");
    return within(formControl as HTMLElement).getByRole("combobox");
}

function openSubstanceDropdown(): void {
    fireEvent.mouseDown(substanceCombobox());
}

function substanceOptions(): HTMLElement[] {
    return within(screen.getByRole("listbox")).getAllByRole("option");
}

/** The "Select All" / "Deselect All" row is always the first option. */
function toggleAllRow(): HTMLElement {
    return substanceOptions()[0];
}

function checkboxesOfSubstances(): HTMLElement[] {
    // skip the leading Select All / Deselect All row
    return substanceOptions()
        .slice(1)
        .map((option) => within(option).getByRole("checkbox"));
}

async function renderSubstanceDetail(): Promise<void> {
    window.history.replaceState(null, "", "/");
    render(
        <SubstanceDetail microorganism={MICROORGANISM} onShowMain={jest.fn()} />
    );
    // wait for the resistance fetch to settle and the filters to hydrate
    await screen.findByTestId("substance-chart");
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

describe("SubstanceDetail substance filter — open position", () => {
    it("focuses the first option so the list opens at the top, not the bottom", async () => {
        await renderSubstanceDetail();

        openSubstanceDropdown();

        const options = substanceOptions();
        // With MUI's default variant="selectedMenu" the *last* selected option
        // is focused, which scrolls an all-selected list to the bottom.
        expect(options[0]).toHaveFocus();
        expect(options[options.length - 1]).not.toHaveFocus();
    });

    it("still opens at the top once the user has selected only the last substance", async () => {
        await renderSubstanceDetail();

        openSubstanceDropdown();
        // clear everything, then tick only the final substance
        fireEvent.click(toggleAllRow());
        fireEvent.click(substanceOptions()[SUBSTANCES.length]);
        fireEvent.keyDown(screen.getByRole("listbox"), { key: "Escape" });

        openSubstanceDropdown();

        expect(substanceOptions()[0]).toHaveFocus();
    });
});

describe("SubstanceDetail substance filter — Deselect All", () => {
    it("starts with every substance selected", async () => {
        await renderSubstanceDetail();

        openSubstanceDropdown();

        expect(checkboxesOfSubstances()).toHaveLength(SUBSTANCES.length);
        checkboxesOfSubstances().forEach((checkbox) =>
            expect(checkbox).toBeChecked()
        );
        expect(toggleAllRow()).toHaveTextContent("DESELECT_ALL");
    });

    it("clears every substance instead of instantly re-selecting them", async () => {
        await renderSubstanceDetail();

        openSubstanceDropdown();
        fireEvent.click(toggleAllRow());

        checkboxesOfSubstances().forEach((checkbox) =>
            expect(checkbox).not.toBeChecked()
        );
        // the row flips back to the "select" affordance
        expect(toggleAllRow()).toHaveTextContent("SELECT_ALL");
    });

    it("empties the chart rather than charting every substance", async () => {
        await renderSubstanceDetail();

        openSubstanceDropdown();
        fireEvent.click(toggleAllRow());

        expect(screen.queryByTestId("substance-chart")).not.toBeInTheDocument();
        expect(
            screen.getByText("No data for selected filters.")
        ).toBeInTheDocument();
    });

    it("re-selects everything when Select All is clicked again", async () => {
        await renderSubstanceDetail();

        openSubstanceDropdown();
        fireEvent.click(toggleAllRow());
        fireEvent.click(toggleAllRow());

        checkboxesOfSubstances().forEach((checkbox) =>
            expect(checkbox).toBeChecked()
        );
        expect(screen.getByTestId("substance-chart")).toBeInTheDocument();
    });
});

describe("SubstanceDetail reset", () => {
    it("treats a reset as 'all substances' on the next search, not as a deliberate clear", async () => {
        await renderSubstanceDetail();

        fireEvent.click(screen.getByText("RESET FILTERS"));
        fireEvent.click(screen.getByText("SEARCH"));

        openSubstanceDropdown();

        checkboxesOfSubstances().forEach((checkbox) =>
            expect(checkbox).toBeChecked()
        );
        expect(screen.getByTestId("substance-chart")).toBeInTheDocument();
    });

    it("does not resurrect substances the user deliberately deselected", async () => {
        await renderSubstanceDetail();

        openSubstanceDropdown();
        fireEvent.click(toggleAllRow());
        fireEvent.keyDown(screen.getByRole("listbox"), { key: "Escape" });

        fireEvent.click(screen.getByText("SEARCH"));

        openSubstanceDropdown();
        checkboxesOfSubstances().forEach((checkbox) =>
            expect(checkbox).not.toBeChecked()
        );
    });
});
