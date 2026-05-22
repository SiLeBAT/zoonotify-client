import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ExplanationTermComponent } from "../ExplanationTermComponent";

const renderWithTheme = (ui: React.ReactElement): ReturnType<typeof render> =>
    render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>);

describe("ExplanationTermComponent", () => {
    it("renders markdown links so they open in a new tab", () => {
        const description =
            "See [the BfR site](https://www.bfr.bund.de) for details.";

        renderWithTheme(
            <ExplanationTermComponent
                handleOpen={() => undefined}
                description={description}
            />
        );

        const link = screen.getByRole("link", { name: "the BfR site" });
        expect(link).toHaveAttribute("target", "_blank");
        expect(link.getAttribute("rel") ?? "").toMatch(/noopener/);
    });
});
