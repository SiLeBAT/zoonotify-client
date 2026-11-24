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
        sampleOrigin: { name: origin, documentId: `o-${origin}` },
        matrix: { name: matrix, documentId: `m-${matrix}` },
        samplingStage: { name: stage, documentId: `st-${stage}` },
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
    // under the minimum N: listed in the Combinations picker, not plotted
    row(2022, "Calves", "Caecal content", "Slaughterhouse", 5, "S. Dublin", 5),
];

/** Stands in for the CMS: answers typing-results requests with the rows. */
function serve(rows: TypingResult[]): void {
    mockedCallApiService.mockImplementation(async (url: string) => {
        if (!url.includes("/typing-results")) return { status: 404 };
        return { status: 200, data: { data: rows } };
    });
}

const SALMONELLA = "?microorganism=Salmonella%20spp.";

/** Opens the typing page; `search` is appended to the organism's detail view. */
function renderPage(
    search = "",
    organism = SALMONELLA
): { location: () => Location } {
    let current: Location | undefined;
    render(
        <MemoryRouter
            initialEntries={[`/microbial-typing${organism}${search}`]}
        >
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

/** Ticks one option of a Search Options dropdown and closes its menu. */
function pick(label: RegExp, option: string): void {
    fireEvent.mouseDown(screen.getByRole("combobox", { name: label }));
    const listbox = screen.getByRole("listbox");
    fireEvent.click(within(listbox).getByRole("option", { name: option }));
    fireEvent.keyDown(listbox, { key: "Escape" });
}

describe("MicrobialTypingPage Salmonella serovar chart", () => {
    beforeEach(() => {
        mockedCallApiService.mockReset();
        mockLanguage = "en";
    });

    it("plots the latest sampling year, one bar per combination with its N", async () => {
        serve(SALMONELLA_ROWS);

        renderPage();

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
        const { location } = renderPage("&lang=en");

        const year = await screen.findByRole("combobox", {
            name: "SamplingYear",
        });
        expect(year).toHaveTextContent("2022");
        fireEvent.mouseDown(year);
        const listbox = screen.getByRole("listbox");
        expect(
            within(listbox)
                .getAllByRole("option")
                .map((o) => o.textContent)
        ).toEqual(["2022", "2021"]);

        fireEvent.click(within(listbox).getByRole("option", { name: "2021" }));

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

    it("lists the year's combinations above the graph and plots only the ticked ones", async () => {
        serve(SALMONELLA_ROWS);
        renderPage();
        await screen.findByText("Laying hens, Faeces/dust, Farm, N = 58");

        fireEvent.mouseDown(
            screen.getByRole("combobox", { name: "Combinations" })
        );
        const listbox = screen.getByRole("listbox");
        const combinations = within(listbox).getAllByRole("option").slice(1); // after Select all
        expect(combinations.map((o) => o.textContent)).toEqual([
            "Laying hens, Faeces/dust, Farm (N=58)",
            "Broilers, Fresh meat, Retail (N=26)",
            "Calves, Caecal content, Slaughterhouse (N=5, data_not_plotted)",
        ]);
        const [layingHens, broilers, calves] = combinations;
        expect(within(layingHens).getByRole("checkbox")).toBeChecked();
        expect(within(broilers).getByRole("checkbox")).toBeChecked();
        // under the minimum N: listed for information, but not pickable
        expect(calves).toHaveAttribute("aria-disabled", "true");
        expect(within(calves).queryByRole("checkbox")).not.toBeInTheDocument();

        fireEvent.click(combinations[0]);

        expect(
            screen.queryByText("Laying hens, Faeces/dust, Farm, N = 58")
        ).not.toBeInTheDocument();
        expect(
            screen.getByText("Broilers, Fresh meat, Retail, N = 26")
        ).toBeInTheDocument();
    });

    it("keeps the ticked combinations in the URL by documentId", async () => {
        serve(SALMONELLA_ROWS);
        const { location } = renderPage("&lang=en");
        await screen.findByText("Laying hens, Faeces/dust, Farm, N = 58");

        pick(/^Combinations/, "Laying hens, Faeces/dust, Farm (N=58)");

        const params = new URLSearchParams(location().search);
        expect(params.getAll("combination")).toEqual([
            "o-Broilers|m-Fresh meat|st-Retail",
        ]);
        expect(params.get("lang")).toBe("en");
    });

    it("opens on the combinations a shared link names", async () => {
        serve(SALMONELLA_ROWS);

        renderPage(
            "&combination=" +
                encodeURIComponent("o-Broilers|m-Fresh meat|st-Retail")
        );

        expect(
            await screen.findByText("Broilers, Fresh meat, Retail, N = 26")
        ).toBeInTheDocument();
        expect(
            screen.queryByText("Laying hens, Faeces/dust, Farm, N = 58")
        ).not.toBeInTheDocument();
    });

    it("deselects and reselects every combination at once", async () => {
        serve(SALMONELLA_ROWS);
        const { location } = renderPage();
        await screen.findByText("Laying hens, Faeces/dust, Farm, N = 58");

        fireEvent.mouseDown(
            screen.getByRole("combobox", { name: "Combinations" })
        );
        fireEvent.click(screen.getByRole("option", { name: "DESELECT_ALL" }));

        expect(screen.queryByText(/, N = \d+$/)).not.toBeInTheDocument();
        expect(new URLSearchParams(location().search).get("combination")).toBe(
            ""
        );

        fireEvent.click(screen.getByRole("option", { name: "SELECT_ALL" }));

        expect(
            screen.getByText("Laying hens, Faeces/dust, Farm, N = 58")
        ).toBeInTheDocument();
        expect(
            screen.getByText("Broilers, Fresh meat, Retail, N = 26")
        ).toBeInTheDocument();
    });

    it("opens on no combination when a shared link deselected them all", async () => {
        serve(SALMONELLA_ROWS);

        renderPage("&combination=");

        await screen.findByRole("combobox", { name: "Combinations" });
        expect(screen.queryByText(/, N = \d+$/)).not.toBeInTheDocument();
    });

    it("starts again from every combination on a new year or Search", async () => {
        serve(SALMONELLA_ROWS);
        const BROILERS = encodeURIComponent(
            "o-Broilers|m-Fresh meat|st-Retail"
        );
        const { location } = renderPage(`&combination=${BROILERS}`);
        await screen.findByText("Broilers, Fresh meat, Retail, N = 26");

        fireEvent.click(screen.getByRole("button", { name: "Search" }));

        expect(
            await screen.findByText("Laying hens, Faeces/dust, Farm, N = 58")
        ).toBeInTheDocument();
        expect(
            new URLSearchParams(location().search).get("combination")
        ).toBeNull();

        pick(/^Combinations/, "Laying hens, Faeces/dust, Farm (N=58)");
        fireEvent.mouseDown(
            screen.getByRole("combobox", { name: "SamplingYear" })
        );
        fireEvent.click(screen.getByRole("option", { name: "2021" }));

        expect(
            new URLSearchParams(location().search).get("combination")
        ).toBeNull();
    });

    it("says so when the typing data cannot be loaded", async () => {
        mockedCallApiService.mockResolvedValue({ status: 403 });

        renderPage();

        expect(await screen.findByRole("alert")).toHaveTextContent("LoadError");
        expect(
            screen.queryByRole("combobox", { name: "SamplingYear" })
        ).not.toBeInTheDocument();
    });

    it("offers the filters but notes that no chart exists yet for other microorganisms", async () => {
        serve(SALMONELLA_ROWS);

        renderPage("", "?microorganism=STEC");

        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
            "Title: STEC"
        );
        expect(
            screen.getByRole("region", { name: "SearchOptions" })
        ).toBeInTheDocument();
        expect(await screen.findByText("NoChartYet")).toBeInTheDocument();
        expect(
            screen.queryByRole("combobox", { name: "SamplingYear" })
        ).not.toBeInTheDocument();
    });

    it("asks the CMS for the page's language", async () => {
        mockLanguage = "de";
        serve(SALMONELLA_ROWS);

        renderPage();

        await screen.findByRole("combobox", { name: "SamplingYear" });
        const url = decodeURIComponent(
            mockedCallApiService.mock.calls
                .map(([called]) => called as string)
                .find((called) => called.includes("/typing-results")) ?? ""
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

        renderPage("&year=2021");

        expect(
            await screen.findByText(
                "Fattening turkeys, Fresh meat, Retail, N = 18"
            )
        ).toBeInTheDocument();
    });

    it("applies the chosen filters on Search and keeps them in the URL", async () => {
        serve(SALMONELLA_ROWS);
        const { location } = renderPage("&lang=en");
        await screen.findByText("Laying hens, Faeces/dust, Farm, N = 58");

        pick(/^SAMPLE_ORIGIN/, "Broilers");

        // nothing changes until Search is pressed
        expect(
            screen.queryAllByText("Laying hens, Faeces/dust, Farm, N = 58")
        ).not.toHaveLength(0);

        fireEvent.click(screen.getByRole("button", { name: "Search" }));

        expect(
            await screen.findByText("Broilers, Fresh meat, Retail, N = 26")
        ).toBeInTheDocument();
        expect(
            screen.queryByText(/^Laying hens, .* N = 58$/)
        ).not.toBeInTheDocument();
        const params = new URLSearchParams(location().search);
        expect(params.get("sampleOrigin")).toBe("o-Broilers");
        expect(params.get("lang")).toBe("en");
    });

    it("opens on the search a shared link names, and Reset clears it", async () => {
        serve(SALMONELLA_ROWS);
        const { location } = renderPage("&lang=en&sampleOrigin=o-Broilers");

        expect(
            await screen.findByText("Broilers, Fresh meat, Retail, N = 26")
        ).toBeInTheDocument();
        expect(
            screen.queryByText(/^Laying hens, .* N = 58$/)
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole("combobox", { name: /^SAMPLE_ORIGIN/ })
        ).toHaveTextContent("Broilers");

        fireEvent.click(screen.getByRole("button", { name: "ResetFilters" }));

        expect(
            await screen.findByText("Laying hens, Faeces/dust, Farm, N = 58")
        ).toBeInTheDocument();
        expect(
            screen.getByRole("combobox", { name: /^SAMPLE_ORIGIN/ })
        ).not.toHaveTextContent("Broilers");
        const params = new URLSearchParams(location().search);
        expect(params.get("sampleOrigin")).toBeNull();
        expect(params.get("microorganism")).toBe("Salmonella spp.");
        expect(params.get("lang")).toBe("en");
    });

    it("explains a filter from the CMS information entry its title names", async () => {
        mockedCallApiService.mockImplementation(async (url: string) => {
            if (url.includes("/informations")) {
                return {
                    status: 200,
                    data: {
                        data: [
                            {
                                title: "Sample Origin",
                                content: "Where the sample was taken.",
                            },
                        ],
                    },
                };
            }
            return { status: 200, data: { data: SALMONELLA_ROWS } };
        });
        renderPage();

        fireEvent.click(
            screen.getByRole("button", { name: "More Info on Sample Origins" })
        );

        const dialog = await screen.findByRole("dialog");
        expect(dialog).toHaveTextContent("Sample Origin");
        expect(dialog).toHaveTextContent("Where the sample was taken.");
        const url = decodeURIComponent(
            mockedCallApiService.mock.calls
                .map(([u]) => u as string)
                .find((u) => u.includes("/informations")) ?? ""
        );
        expect(url).toContain("filters[title][$eqi]=SAMPLE_ORIGIN");
        expect(url).toContain("locale=en");
    });

    it.each([
        ["More Info on Sampling Year", "SamplingYear"],
        ["More Info on Combinations", "Combinations"],
    ])(
        "explains the graph filter behind %s from the CMS",
        async (button, title) => {
            mockedCallApiService.mockImplementation(async (url: string) => {
                if (url.includes("/informations")) {
                    return {
                        status: 200,
                        data: { data: [{ title, content: "Explained." }] },
                    };
                }
                return { status: 200, data: { data: SALMONELLA_ROWS } };
            });
            renderPage();
            await screen.findByText("Laying hens, Faeces/dust, Farm, N = 58");

            fireEvent.click(screen.getByRole("button", { name: button }));

            expect(await screen.findByRole("dialog")).toHaveTextContent(
                "Explained."
            );
            const url = decodeURIComponent(
                mockedCallApiService.mock.calls
                    .map(([u]) => u as string)
                    .find((u) => u.includes("/informations")) ?? ""
            );
            expect(url).toContain(`filters[title][$eqi]=${title}`);
        }
    );

    it("shows the CMS's typing information below the graph in the UI language", async () => {
        mockLanguage = "de";
        mockedCallApiService.mockImplementation(async (url: string) => {
            if (url.includes("/typing-information")) {
                return {
                    status: 200,
                    data: {
                        data: {
                            title: "Zu dieser Grafik",
                            description: "Serovare sind **gruppiert**.",
                        },
                    },
                };
            }
            if (url.includes("/typing-results")) {
                return { status: 200, data: { data: SALMONELLA_ROWS } };
            }
            return { status: 404 };
        });
        renderPage();

        const box = await screen.findByTestId("typing-information");
        expect(within(box).getByText("Zu dieser Grafik")).toBeInTheDocument();
        expect(within(box).getByText("gruppiert").tagName).toBe("STRONG");
        const chart = document.querySelector(".recharts-wrapper");
        expect(
            chart?.compareDocumentPosition(box) &
                Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy();
        const infoUrl = mockedCallApiService.mock.calls
            .map(([url]) => url)
            .find((url) => url.includes("/typing-information"));
        expect(infoUrl).toContain("locale=de");
    });

    it("shows no information box while the CMS has none", async () => {
        serve(SALMONELLA_ROWS);
        renderPage();

        await screen.findByRole("combobox", { name: "SamplingYear" });
        expect(
            screen.queryByTestId("typing-information")
        ).not.toBeInTheDocument();
    });
});
