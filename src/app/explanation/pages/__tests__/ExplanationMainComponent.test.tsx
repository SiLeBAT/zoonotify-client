import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { InfoPageComponent } from "../ExplanationMainComponent";
import { useExplanationPageComponent } from "../explanationUseCases";

jest.mock("../explanationUseCases", () => ({
    useExplanationPageComponent: jest.fn(),
}));

jest.mock("../../../shared/components/layout/PageLayoutComponent", () => ({
    PageLayoutComponent: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
}));

jest.mock("../../../shared/components/accordion/ZNAccordion", () => ({
    ZNAccordion: ({ content }: { content: React.ReactNode }) => (
        <div>{content}</div>
    ),
}));

jest.mock("../../components/ExplanationTermComponent", () => ({
    ExplanationTermComponent: () => <div />,
}));

jest.mock("../../components/InfoPage-AmrsDialog.component", () => ({
    InfoPageAmrDialogComponent: () => <div />,
}));

const renderPage = (): ReturnType<typeof render> =>
    render(
        <ThemeProvider theme={createTheme()}>
            <InfoPageComponent
                tableData={{} as never}
                onAmrDataExport={(): void => undefined}
            />
        </ThemeProvider>
    );

describe("InfoPageComponent (explanation page)", () => {
    it("renders markdown links in the main section so they open in a new tab", () => {
        (useExplanationPageComponent as jest.Mock).mockReturnValue({
            model: {
                title: "Explanations",
                explanationCollection: {},
                mainSection: [
                    {
                        anchor: "main",
                        title: "Main",
                        description:
                            "Visit [BfR](https://www.bfr.bund.de) for details.",
                        section: "MAIN",
                    },
                ],
                amrData: [],
                openAmrDialog: false,
                currentAMRID: "",
                deepLink: "",
                activeAnchor: null,
            },
            operations: {
                handleOpen: jest.fn(),
                handleClose: jest.fn(),
                openSectionByAnchor: jest.fn(),
                closeActiveSection: jest.fn(),
                getSectionLabel: (k: string) => k,
            },
        });

        renderPage();

        const link = screen.getByRole("link", { name: "BfR" });
        expect(link).toHaveAttribute("target", "_blank");
        expect(link.getAttribute("rel") ?? "").toMatch(/noopener/);
    });
});
