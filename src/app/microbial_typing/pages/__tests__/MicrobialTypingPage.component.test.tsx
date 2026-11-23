import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";
import type { Location } from "history";
import { MicrobialTypingPageComponent } from "../MicrobialTypingPage.component";

jest.mock("../../../shared/components/layout/PageLayoutComponent", () => ({
    PageLayoutComponent: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
}));

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en" },
    }),
}));

// Every opened microorganism loads its typing rows: answer with none.
jest.mock("../../../shared/infrastructure/api/callApi.service", () => ({
    callApiService: jest.fn(async () => ({ status: 200, data: { data: [] } })),
}));

const EXPECTED_ORDER = [
    "Salmonella spp.",
    "Campylobacter spp.",
    "Listeria monocytogenes",
    "MRSA",
    "STEC",
    "Enterococcus spp.",
];

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

function sidebarButtons(): HTMLElement[] {
    const nav = screen.getByRole("navigation", {
        name: "SelectMicroorganism",
    });
    return within(nav).getAllByRole("button");
}

function button(label: string): HTMLElement {
    const found = sidebarButtons().find((b) => b.textContent === label);
    if (!found) throw new Error(`no sidebar entry "${label}"`);
    return found;
}

/** The text of every italic run inside an element. */
function italics(element: HTMLElement): string[] {
    return Array.from(element.querySelectorAll("i")).map(
        (i) => i.textContent ?? ""
    );
}

describe("MicrobialTypingPage microorganism selection", () => {
    it("lists the six microorganisms in the ticket's order", () => {
        renderPage();

        expect(sidebarButtons().map((b) => b.textContent)).toEqual(
            EXPECTED_ORDER
        );
    });

    it("italicises genus and species but not spp. or abbreviations", () => {
        renderPage();

        expect(italics(button("Salmonella spp."))).toEqual(["Salmonella"]);
        expect(italics(button("Campylobacter spp."))).toEqual([
            "Campylobacter",
        ]);
        expect(italics(button("Listeria monocytogenes"))).toEqual([
            "Listeria monocytogenes",
        ]);
        expect(italics(button("MRSA"))).toEqual([]);
        expect(italics(button("STEC"))).toEqual([]);
        expect(italics(button("Enterococcus spp."))).toEqual(["Enterococcus"]);
    });

    it("lands on the list with no microorganism open", () => {
        renderPage();

        sidebarButtons().forEach((b) =>
            expect(b).not.toHaveAttribute("aria-current")
        );
        expect(
            screen.queryByRole("region", { name: "SearchOptions" })
        ).not.toBeInTheDocument();
    });

    it("opens a microorganism's search options and keeps the language", () => {
        const { location } = renderPage("?lang=en");

        fireEvent.click(button("Listeria monocytogenes"));

        const params = new URLSearchParams(location().search);
        expect(params.get("microorganism")).toBe("Listeria monocytogenes");
        expect(params.get("lang")).toBe("en");
        expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
            "Title: Listeria monocytogenes"
        );
        const panel = screen.getByRole("region", { name: "SearchOptions" });
        expect(
            within(panel)
                .getAllByRole("combobox")
                .map((c) => c.getAttribute("aria-labelledby"))
        ).toEqual([
            "typing-filter-superCategorySampleOrigin",
            "typing-filter-sampleOrigin",
            "typing-filter-samplingStage",
            "typing-filter-matrixGroup",
            "typing-filter-matrix",
        ]);
        expect(
            within(panel).getByRole("button", { name: "Search" })
        ).toBeInTheDocument();
        expect(
            within(panel).getByRole("button", { name: "ResetFilters" })
        ).toBeInTheDocument();
    });

    it("opens on the microorganism a shared link names", () => {
        renderPage("?microorganism=STEC&lang=en");

        expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
            "Title: STEC"
        );
        expect(
            screen.getByRole("region", { name: "SearchOptions" })
        ).toBeInTheDocument();
    });

    it("lands on the list for an unknown microorganism", () => {
        renderPage("?microorganism=Unknown");

        expect(sidebarButtons()).toHaveLength(6);
        expect(
            screen.queryByRole("region", { name: "SearchOptions" })
        ).not.toBeInTheDocument();
    });

    it("leads back to the list from the breadcrumb, keeping the language", () => {
        const { location } = renderPage("?microorganism=MRSA&lang=en");

        fireEvent.click(screen.getByRole("button", { name: "Title" }));

        const params = new URLSearchParams(location().search);
        expect(params.get("microorganism")).toBeNull();
        expect(params.get("lang")).toBe("en");
        expect(sidebarButtons()).toHaveLength(6);
    });

    it("collapses the search options into a side panel and opens them again", () => {
        renderPage("?microorganism=MRSA");

        fireEvent.click(screen.getByRole("button", { name: "apply filter" }));
        expect(
            screen.queryByRole("region", { name: "SearchOptions" })
        ).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "apply filter" }));
        expect(
            screen.getByRole("region", { name: "SearchOptions" })
        ).toBeInTheDocument();
    });
});
