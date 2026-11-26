import React from "react";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { MultiResistanceDetail } from "../MultiResistanceDetail";
import {
    buildMultiResistanceBars,
    decodeMultiResistanceState,
    encodeMultiResistanceState,
} from "../multiResistanceHelpers";
import { emptyFilterState } from "../resistanceHelpers";
import type {
    MultiResistanceBar,
    MultiResistanceItem,
} from "../multiResistanceHelpers";
import { callApiService } from "../../../shared/infrastructure/api/callApi.service";
import fixture from "./fixtures/multiResistance.fixture.json";
import { createLinkFinder } from "../../../link_finder";
import {
    snapshotIndex,
    snapshotOfficialNames,
} from "../../../link_finder/__fixtures__/snapshot";

jest.mock("../../../shared/infrastructure/api/callApi.service", () => ({
    callApiService: jest.fn(),
}));
const mockedCallApiService = callApiService as jest.MockedFunction<
    typeof callApiService
>;

type Fixture = Record<string, { en: MultiResistanceItem[] }>;

/** Stands in for the CMS: answers with the fixture rows of the requested microorganism. */
function serveFixture(): void {
    mockedCallApiService.mockImplementation(async (url: string) => {
        const decoded = decodeURIComponent(url);
        const microorganism = Object.keys(fixture).find((name) =>
            decoded.includes(name)
        );
        const rows = microorganism
            ? (fixture as Fixture)[microorganism].en
            : [];
        return { status: 200, data: { data: rows } };
    });
}

jest.mock("../../../shared/components/layout/SidebarComponent", () => ({
    SidebarComponent: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
}));

// recharts draws nothing measurable in jsdom; the bars handed to it are the behaviour.
jest.mock("../MultiResistanceChart", () => ({
    MultiResistanceChart: ({ bars }: { bars: MultiResistanceBar[] }) => (
        <ul data-testid="multi-resistance-chart">
            {bars.map((b) => (
                <li key={b.key}>{b.label}</li>
            ))}
        </ul>
    ),
}));

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en", changeLanguage: jest.fn() },
    }),
}));

beforeAll(() => {
    window.scrollTo = jest.fn();
});

beforeEach(() => {
    mockedCallApiService.mockReset();
    serveFixture();
});

function renderDetail(microorganism: string): void {
    window.history.replaceState(null, "", "/");
    render(<MultiResistanceDetail microorganism={microorganism} />);
}

function plottedLabels(): string[] {
    return within(screen.getByTestId("multi-resistance-chart"))
        .queryAllByRole("listitem")
        .map((li) => li.textContent ?? "");
}

describe("MultiResistanceDetail", () => {
    it("plots every Combination of the latest year that reaches the Minimum N", async () => {
        renderDetail("E. coli");

        await screen.findByTestId("multi-resistance-chart");

        expect(plottedLabels()).toEqual([
            "Caecal content – Broiler – Slaughterhouse (N = 170)",
            "Chicken meat – Broiler – Retail (N = 150)",
        ]);
    });

    it("opens a Link Finder link with every Combination plotted, as the page does on its own", async () => {
        const { links } = await createLinkFinder(() =>
            Promise.resolve(snapshotOfficialNames)
        ).find("antimicrobial resistance", "en", snapshotIndex, "E. coli");
        const link = links.find((l) => l.view === "multi");
        expect(link).toBeDefined();
        window.history.replaceState(null, "", link?.url);
        render(<MultiResistanceDetail microorganism="E. coli" />);

        await screen.findByTestId("multi-resistance-chart");

        expect(plottedLabels()).toEqual([
            "Caecal content – Broiler – Slaughterhouse (N = 170)",
            "Chicken meat – Broiler – Retail (N = 150)",
        ]);
    });

    it("lists a Combination under the Minimum N in the picker as not plotted", async () => {
        renderDetail("E. coli");
        await screen.findByTestId("multi-resistance-chart");

        fireEvent.mouseDown(combinationPicker());

        expect(
            within(screen.getByRole("listbox")).getByText(
                /N=7, data_not_plotted/
            )
        ).toBeInTheDocument();
    });

    it("lists a Combination under the Minimum N disabled and without a checkbox (#1964)", async () => {
        renderDetail("E. coli");
        await screen.findByTestId("multi-resistance-chart");

        fireEvent.mouseDown(combinationPicker());

        const lowN = combinationOption(/N=7, data_not_plotted/);
        expect(lowN).toHaveAttribute("aria-disabled", "true");
        expect(within(lowN).queryByRole("checkbox")).not.toBeInTheDocument();
    });

    it("counts every bar shown as all selected, whatever is under the Minimum N (#1964)", async () => {
        renderDetail("E. coli");
        await screen.findByTestId("multi-resistance-chart");
        fireEvent.mouseDown(combinationPicker());

        fireEvent.click(combinationOption(/DESELECT_ALL/));
        fireEvent.click(combinationOption(/Caecal content/));
        fireEvent.click(combinationOption(/Chicken meat/));

        const selectAll = combinationOption(/SELECT_ALL/);
        expect(selectAll).toHaveTextContent("DESELECT_ALL");
        const box = within(selectAll).getByRole("checkbox");
        expect(box).toBeChecked();
        expect(box).toHaveAttribute("data-indeterminate", "false");
    });

    it("shares only plotted Combinations in the link (#1964)", async () => {
        renderDetail("E. coli");
        await screen.findByTestId("multi-resistance-chart");
        fireEvent.mouseDown(combinationPicker());

        fireEvent.click(combinationOption(/Chicken meat/));
        fireEvent.keyDown(screen.getByRole("listbox"), { key: "Escape" });

        expect(plottedLabels()).toEqual([
            "Caecal content – Broiler – Slaughterhouse (N = 170)",
        ]);
        expect(sharedCombinations()).toHaveLength(1);
    });

    it("still opens an older link that names a Combination under the Minimum N (#1964)", async () => {
        const rows = (fixture as Fixture)["E. coli"].en;
        const latest = Math.max(...rows.map((r) => r.samplingYear));
        const { bars, belowMinimum } = buildMultiResistanceBars(
            rows.filter((r) => r.samplingYear === latest),
            "E. coli"
        );
        const caecal = bars.find((b) => b.name.startsWith("Caecal content"));
        const s = encodeMultiResistanceState(
            {
                microorganism: "E. coli",
                lang: "en",
                selected: { ...emptyFilterState },
                year: latest,
                combinations: [caecal?.key ?? "", belowMinimum[0].key],
            },
            rows
        );
        window.history.replaceState(null, "", `/?s=${s}`);
        render(<MultiResistanceDetail microorganism="E. coli" />);

        await screen.findByTestId("multi-resistance-chart");

        expect(plottedLabels()).toEqual([
            "Caecal content – Broiler – Slaughterhouse (N = 170)",
        ]);
        expect(sharedCombinations()).toEqual([caecal?.key]);
    });

    it("requests the microorganism's multi-resistance rows from the CMS in the UI language", async () => {
        renderDetail("E. coli");
        await screen.findByTestId("multi-resistance-chart");

        const url = decodeURIComponent(mockedCallApiService.mock.calls[0][0]);
        expect(url).toContain("/multi-resistances?locale=en");
        expect(url).toContain("filters[microorganism][name]");
        expect(url).toContain("E. coli");
    });

    it("says so when the microorganism has no multi-resistance data", async () => {
        renderDetail("Salmonella spp.");

        expect(
            await screen.findByText("No_multi_resistance_data")
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId("multi-resistance-chart")
        ).not.toBeInTheDocument();
    });

    it("shows the CMS's multi-resistance information below the graph in the UI language", async () => {
        mockedCallApiService.mockImplementation(async (url: string) =>
            url.includes("/multi-resistance-information")
                ? {
                      status: 200,
                      data: {
                          data: {
                              title: "About this graph",
                              description: "Isolates are **grouped**.",
                          },
                      },
                  }
                : { status: 200, data: { data: [] } }
        );
        renderDetail("E. coli");

        expect(await screen.findByText("About this graph")).toBeInTheDocument();
        expect(screen.getByText("grouped").tagName).toBe("STRONG");
        const infoUrl = mockedCallApiService.mock.calls
            .map(([url]) => url)
            .find((url) => url.includes("/multi-resistance-information"));
        expect(infoUrl).toContain("locale=en");
    });

    it("shows no information box while the CMS has none", async () => {
        renderDetail("E. coli");
        await screen.findByTestId("multi-resistance-chart");

        expect(
            screen.queryByTestId("multi-resistance-information")
        ).not.toBeInTheDocument();
    });
});

/** The Combination picker, located via its floating label. */
function combinationPicker(): HTMLElement {
    const label = Array.from(document.querySelectorAll("label")).find(
        (candidate) => candidate.textContent === "combinations"
    );
    if (!label) throw new Error("combination picker label not found");
    return within(
        label.closest(".MuiFormControl-root") as HTMLElement
    ).getByRole("combobox");
}

/** The open Combination picker's option whose text matches `text`. */
function combinationOption(text: RegExp): HTMLElement {
    return within(screen.getByRole("listbox"))
        .getByText(text)
        .closest('[role="option"]') as HTMLElement;
}

/** The Combination keys the page's share link (`?s=`) currently holds. */
function sharedCombinations(): string[] {
    const s = new URLSearchParams(window.location.search).get("s");
    if (!s) throw new Error("no share link");
    return decodeMultiResistanceState(s, [])?.combinations ?? [];
}
