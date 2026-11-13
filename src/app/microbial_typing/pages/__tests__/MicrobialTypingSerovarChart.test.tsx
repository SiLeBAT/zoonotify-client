import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";
import type { Location } from "history";
import { callApiService } from "../../../shared/infrastructure/api/callApi.service";
import { MicrobialTypingPageComponent } from "../MicrobialTypingPage.component";
import type { TypingResult } from "../typingData";

jest.mock("../../../shared/infrastructure/api/callApi.service", () => ({
    callApiService: jest.fn(),
}));
const mockedCallApiService = callApiService as jest.MockedFunction<
    typeof callApiService
>;

jest.mock("../../../shared/components/layout/PageLayoutComponent", () => ({
    PageLayoutComponent: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
}));

let mockLanguage = "en";
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: mockLanguage },
    }),
}));

// jsdom lays nothing out, so ResponsiveContainer would measure 0×0 and draw
// no chart. Give the real chart a fixed size instead.
jest.mock("recharts", () => {
    const actual = jest.requireActual("recharts");
    const { cloneElement } = jest.requireActual("react");
    return {
        ...actual,
        ResponsiveContainer: ({
            children,
            height,
        }: {
            children: React.ReactElement;
            height: number;
        }) => cloneElement(children, { width: 900, height }),
    };
});

function row(
    samplingYear: number,
    origin: string,
    matrix: string,
    stage: string,
    n: number,
    serovar: string,
    isolates: number
): TypingResult {
    return {
        samplingYear,
        numberOfIsolates: n,
        numberOfIsolatesInSubgroup: isolates,
        sampleOrigin: { name: origin },
        matrix: { name: matrix },
        samplingStage: { name: stage },
        typingSubgroup: { name: serovar },
    };
}

const SALMONELLA_ROWS: TypingResult[] = [
    row(
        2021,
        "Fattening turkeys",
        "Fresh meat",
        "Retail",
        18,
        "S. Infantis",
        18
    ),
    row(2022, "Laying hens", "Faeces/dust", "Farm", 58, "S. Enteritidis", 40),
    row(2022, "Laying hens", "Faeces/dust", "Farm", 58, "S. Typhimurium", 18),
    row(2022, "Broilers", "Fresh meat", "Retail", 26, "S. Infantis", 26),
];

/** Stands in for the CMS: answers typing-results requests with the rows. */
function serve(rows: TypingResult[]): void {
    mockedCallApiService.mockImplementation(async (url: string) => {
        if (!url.includes("/typing-results")) return { status: 404 };
        return { status: 200, data: { data: rows } };
    });
}

function renderPage(search = ""): { location: () => Location } {
    let current: Location | undefined;
    render(
        <MemoryRouter initialEntries={[`/microbial-typing${search}`]}>
            <MicrobialTypingPageComponent />
            <Route
                path="*"
                render={({ location }) => {
                    current = location;
                    return null;
                }}
            />
        </MemoryRouter>
    );
    return { location: () => current as Location };
}

describe("MicrobialTypingPage Salmonella serovar chart", () => {
    beforeEach(() => {
        mockedCallApiService.mockReset();
        mockLanguage = "en";
    });

    it("plots the latest sampling year, one bar per combination with its N", async () => {
        serve(SALMONELLA_ROWS);

        renderPage("?microorganism=Salmonella%20spp.");

        expect(
            await screen.findByText("Laying hens, Faeces/dust, Farm, N = 58")
        ).toBeInTheDocument();
        expect(
            screen.getByText("Broilers, Fresh meat, Retail, N = 26")
        ).toBeInTheDocument();
        expect(screen.queryByText(/Fattening turkeys/)).not.toBeInTheDocument();
    });

    it("offers the sampling years newest first and replots the chosen one", async () => {
        serve(SALMONELLA_ROWS);
        const { location } = renderPage("?lang=en");

        const year = await screen.findByRole("combobox", {
            name: "SamplingYear",
        });
        expect(
            within(year)
                .getAllByRole("option")
                .map((o) => o.textContent)
        ).toEqual(["2022", "2021"]);
        expect(year).toHaveValue("2022");

        fireEvent.change(year, { target: { value: "2021" } });

        expect(
            await screen.findByText(
                "Fattening turkeys, Fresh meat, Retail, N = 18"
            )
        ).toBeInTheDocument();
        expect(screen.queryByText(/Laying hens/)).not.toBeInTheDocument();
        const params = new URLSearchParams(location().search);
        expect(params.get("year")).toBe("2021");
        expect(params.get("lang")).toBe("en");
    });

    it("says so when the typing data cannot be loaded", async () => {
        mockedCallApiService.mockResolvedValue({ status: 403 });

        renderPage();

        expect(await screen.findByRole("alert")).toHaveTextContent("LoadError");
        expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    });

    it("draws no serovar chart for other microorganisms", async () => {
        serve(SALMONELLA_ROWS);

        renderPage("?microorganism=STEC");

        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
            "Title: STEC"
        );
        expect(mockedCallApiService).not.toHaveBeenCalled();
        expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    });

    it("asks the CMS for the page's language", async () => {
        mockLanguage = "de";
        serve(SALMONELLA_ROWS);

        renderPage();

        await screen.findByRole("combobox", { name: "SamplingYear" });
        const url = decodeURIComponent(
            mockedCallApiService.mock.calls[0][0] as string
        );
        expect(url).toContain("/typing-results?locale=de");
        expect(url).toContain(
            "filters[microorganism][name][$eq]=Salmonella spp."
        );
    });

    it("lists the lumped serovars as one legend entry", async () => {
        // Twelve serovars in one combination: two of them fall outside the top ten.
        serve(
            Array.from({ length: 12 }, (_, i) =>
                row(
                    2022,
                    "Broilers",
                    "Faeces/dust",
                    "Farm",
                    120,
                    `S. Serovar${i + 1}`,
                    10
                )
            )
        );

        renderPage();

        expect(await screen.findByText("OtherSerovars")).toBeInTheDocument();
        expect(screen.getByText("S. Serovar1")).toBeInTheDocument();
        expect(screen.queryByText("S. Serovar12")).not.toBeInTheDocument();
    });

    it("opens on the year a shared link names", async () => {
        serve(SALMONELLA_ROWS);

        renderPage("?year=2021");

        expect(
            await screen.findByText(
                "Fattening turkeys, Fresh meat, Retail, N = 18"
            )
        ).toBeInTheDocument();
    });
});
