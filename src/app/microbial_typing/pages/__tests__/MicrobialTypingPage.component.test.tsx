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
    useTranslation: () => ({ t: (key: string) => key }),
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

    it("selects the first microorganism by default", () => {
        renderPage();

        expect(button("Salmonella spp.")).toHaveAttribute(
            "aria-current",
            "true"
        );
        expect(button("MRSA")).not.toHaveAttribute("aria-current");
    });

    it("opens on the microorganism a shared link names", () => {
        renderPage("?microorganism=STEC&lang=en");

        expect(button("STEC")).toHaveAttribute("aria-current", "true");
        expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
            "Title: STEC"
        );
    });

    it("falls back to the first microorganism for an unknown value", () => {
        renderPage("?microorganism=Unknown");

        expect(button("Salmonella spp.")).toHaveAttribute(
            "aria-current",
            "true"
        );
    });

    it("writes the selection to the URL and keeps the language", () => {
        const { location } = renderPage("?lang=en");

        fireEvent.click(button("Listeria monocytogenes"));

        const params = new URLSearchParams(location().search);
        expect(params.get("microorganism")).toBe("Listeria monocytogenes");
        expect(params.get("lang")).toBe("en");
        expect(button("Listeria monocytogenes")).toHaveAttribute(
            "aria-current",
            "true"
        );
    });
});
