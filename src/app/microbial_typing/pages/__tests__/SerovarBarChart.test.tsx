import React from "react";
import { render } from "@testing-library/react";
import typingDe from "../../../../locales/de/MicrobialTyping.json";
import typingEn from "../../../../locales/en/MicrobialTyping.json";
import { SerovarBarChart } from "../SerovarBarChart";
import type { SerovarChart } from "../serovarChart";

// The real locale strings, so the axis wording is checked as users read it.
let mockStrings: Record<string, string> = typingEn;
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => mockStrings[key] ?? key,
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

const CHART: SerovarChart = {
    serovars: ["S. Infantis"],
    bars: [
        {
            key: "o|m|st",
            sampleOrigin: "Broilers",
            matrix: "Fresh meat",
            samplingStage: "Retail",
            n: 26,
            shares: { "S. Infantis": 100 },
        },
    ],
    belowMinimum: [],
};

/** The SVG text element whose whole text reads `text`. */
function svgText(container: HTMLElement, text: string): Element | undefined {
    return Array.from(container.querySelectorAll("text")).find(
        (element) => element.textContent === text
    );
}

describe("SerovarBarChart x-axis", () => {
    it.each([
        ["en", typingEn, "Proportion of Salmonella spp. isolates (%)"],
        ["de", typingDe, "Anteil Salmonella spp. Isolate (%)"],
    ])(
        "names the proportion of Salmonella isolates, the genus in italics (%s)",
        (_, strings, label) => {
            mockStrings = strings;

            const { container } = render(<SerovarBarChart chart={CHART} />);

            const axisLabel = svgText(container, label);
            expect(axisLabel).toBeDefined();
            const italic = axisLabel?.querySelector('[font-style="italic"]');
            expect(italic?.textContent).toBe("Salmonella");
        }
    );
});
