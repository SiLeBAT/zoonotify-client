import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import {
    PrevalenceDataProvider,
    usePrevalenceFilters,
} from "../PrevalenceDataContext";
import { callApiService } from "../../../shared/infrastructure/api/callApi.service";

/**
 * A filtered prevalence URL (a share link or bookmark) must show only the
 * filtered rows, whatever order the API answers in (#1919).
 *
 * The seam is the provider read through `usePrevalenceFilters`; the API is
 * faked at `callApiService` so the test decides when each answer lands.
 */

jest.mock("i18next", () => ({
    __esModule: true,
    default: { language: "en" },
}));

jest.mock("../../../hooks/useDataUpdateDate", () => ({
    fetchDataUpdateDate: jest.fn().mockResolvedValue("2026-01-01"),
}));

jest.mock("../../../shared/infrastructure/api/callApi.service", () => ({
    callApiService: jest.fn(),
}));

const SALMONELLA = { id: 1, documentId: "doc-salm", name: "Salmonella spp." };
const CAMPYLOBACTER = { id: 2, documentId: "doc-campy", name: "Campylobacter" };

function row(id: number, microorganism: typeof SALMONELLA): object {
    return {
        id,
        samplingYear: 2024,
        numberOfSamples: 10,
        numberOfPositive: 1,
        percentageOfPositive: 10,
        ciMin: 1,
        ciMax: 20,
        microorganism,
    };
}

const ALL_ROWS = [
    row(1, SALMONELLA),
    row(2, CAMPYLOBACTER),
    row(3, CAMPYLOBACTER),
];
const SALMONELLA_ROWS = [row(1, SALMONELLA)];

interface Pending {
    url: string;
    resolve: (rows: object[]) => void;
}

/** Prevalence requests wait here until the test answers them. */
let pending: Pending[] = [];

const isPrevalenceRequest = (url: string): boolean =>
    url.includes("/prevalences?");
const isFiltered = (url: string): boolean =>
    decodeURIComponent(url).includes("filters[");

function fakeApi(url: string): Promise<unknown> {
    if (isPrevalenceRequest(url)) {
        return new Promise((resolve) =>
            pending.push({
                url,
                resolve: (rows) => resolve({ data: { data: rows } }),
            })
        );
    }
    if (url.includes("/microorganisms?")) {
        return Promise.resolve({
            data: { data: [SALMONELLA, CAMPYLOBACTER] },
        });
    }
    return Promise.resolve({ data: { data: [] } });
}

/** Answers the first waiting request that matches, once one is waiting. */
async function answer(
    matches: (url: string) => boolean,
    rows: object[]
): Promise<void> {
    const found = await waitFor(() => {
        const match = pending.find((p) => matches(p.url));
        if (!match) throw new Error("no matching request is waiting yet");
        return match;
    });
    pending = pending.filter((p) => p !== found);
    await act(async () => {
        found.resolve(rows);
    });
}

function Probe(): React.ReactElement {
    const { prevalenceData, loading } = usePrevalenceFilters();
    return (
        <div>
            <span data-testid="rows">{prevalenceData.length}</span>
            <span data-testid="loading">{String(loading)}</span>
        </div>
    );
}

beforeEach(() => {
    pending = [];
    (callApiService as jest.Mock).mockImplementation(fakeApi);
});

describe("PrevalenceDataProvider, filtered deep link", () => {
    it("keeps the filtered rows when an unfiltered answer arrives after the filtered one", async () => {
        window.history.replaceState(
            null,
            "",
            "/prevalence?microorganism=Salmonella%20spp.&lang=en"
        );

        render(
            <PrevalenceDataProvider>
                <Probe />
            </PrevalenceDataProvider>
        );

        // Hold back every unfiltered answer except what the page needs to
        // start the filtered search; answer the filtered one; then let the
        // late unfiltered answers land.
        await answer((url) => !isFiltered(url), ALL_ROWS);
        await answer(isFiltered, SALMONELLA_ROWS);
        await act(async () => {
            pending.forEach((p) => p.resolve(ALL_ROWS));
        });

        await waitFor(() =>
            expect(screen.getByTestId("loading")).toHaveTextContent("false")
        );
        expect(screen.getByTestId("rows")).toHaveTextContent("1");
    });

    it("leaves a share link that names each selection once", async () => {
        window.history.replaceState(
            null,
            "",
            "/prevalence?microorganism=Salmonella%20spp.&lang=en"
        );

        render(
            <PrevalenceDataProvider>
                <Probe />
            </PrevalenceDataProvider>
        );

        await answer((url) => !isFiltered(url), ALL_ROWS);
        await answer(isFiltered, SALMONELLA_ROWS);
        await act(async () => {
            pending.forEach((p) => p.resolve(ALL_ROWS));
        });
        await waitFor(() =>
            expect(screen.getByTestId("loading")).toHaveTextContent("false")
        );

        const params = new URLSearchParams(window.location.search);
        expect(params.getAll("microorganism")).toEqual(["Salmonella spp."]);
        expect(params.get("lang")).toBe("en");
    });
});
