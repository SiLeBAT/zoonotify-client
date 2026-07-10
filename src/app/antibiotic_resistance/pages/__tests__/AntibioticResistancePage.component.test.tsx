import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
    AntibioticResistancePageComponent,
    FormattedMicroorganismName,
} from "../AntibioticResistancePage.component";

jest.mock("../../../shared/components/layout/PageLayoutComponent", () => ({
    PageLayoutComponent: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
}));

jest.mock("../amrPageUseCase", () => ({
    useAmrPageTooltips: () => ({
        trendTooltip: "",
        substanceTooltip: "",
        multiTooltip: "",
    }),
}));

jest.mock("../TrendDetails", () => ({
    TrendDetails: () => <div data-testid="trend-details" />,
}));

jest.mock("../SubstanceDetail", () => ({
    SubstanceDetail: () => <div data-testid="substance-detail" />,
}));

jest.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

const ESBL = "ESBL/AmpC E. coli";

/** Find a sidebar entry by its visible label, ignoring markup/whitespace. */
function navItem(label: string): HTMLElement | undefined {
    return Array.from(
        document.querySelectorAll<HTMLElement>(".abx-nav-item")
    ).find((li) => li.textContent?.replace(/\s+/g, " ").trim() === label);
}

function renderPage(search = ""): void {
    window.history.replaceState(null, "", `/${search}`);
    render(
        <MemoryRouter>
            <AntibioticResistancePageComponent />
        </MemoryRouter>
    );
}

beforeAll(() => {
    window.scrollTo = jest.fn();
});

describe("AntibioticResistancePage sidebar", () => {
    it("offers ESBL/AmpC E. coli as a selectable organism", () => {
        renderPage();

        const item = navItem(ESBL);
        expect(item).toBeDefined();

        fireEvent.click(item as HTMLElement);

        expect(navItem(ESBL)).toHaveClass("abx-active");
    });

    it("announces Coming soon instead of empty charts when ESBL/AmpC E. coli is selected", () => {
        renderPage();

        fireEvent.click(navItem(ESBL) as HTMLElement);

        expect(screen.getByText("ComingSoon")).toBeInTheDocument();
        expect(screen.queryByAltText("Trend")).not.toBeInTheDocument();
        expect(screen.queryByAltText("Substans")).not.toBeInTheDocument();
    });

    it("still offers the chart tiles for organisms that have data", () => {
        renderPage();

        expect(screen.getByAltText("Trend")).toBeInTheDocument();
        expect(screen.getByAltText("Substans")).toBeInTheDocument();
        expect(screen.queryByText("ComingSoon")).not.toBeInTheDocument();
    });
});

describe("AntibioticResistancePage deep links", () => {
    it("restores an ESBL/AmpC E. coli selection from the URL", () => {
        renderPage("?microorganism=ESBL%2FAmpC%20E.%20coli&view=main");

        expect(navItem(ESBL)).toHaveClass("abx-active");
    });

    it("refuses to open a chart view for an organism that has no data", () => {
        renderPage("?microorganism=ESBL%2FAmpC%20E.%20coli&view=trend");

        expect(screen.queryByTestId("trend-details")).not.toBeInTheDocument();
        expect(navItem(ESBL)).toHaveClass("abx-active");
    });

    it("still honours a chart deep link for an organism that has data", () => {
        renderPage("?microorganism=E.%20coli&view=trend");

        expect(screen.getByTestId("trend-details")).toBeInTheDocument();
    });
});

describe("FormattedMicroorganismName", () => {
    it("italicises only the species part of ESBL/AmpC E. coli", () => {
        const { container } = render(
            <FormattedMicroorganismName microName={ESBL} />
        );

        const italicised = Array.from(container.querySelectorAll("i")).map(
            (el) => el.textContent
        );
        expect(italicised).toEqual(["E.", "coli"]);

        // The resistance-mechanism prefix stays upright.
        expect(container.textContent).toContain("ESBL/AmpC");
    });
});
