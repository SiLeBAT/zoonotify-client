import React from "react";
import { render } from "@testing-library/react";
import typingDe from "../../../../locales/de/MicrobialTyping.json";
import typingEn from "../../../../locales/en/MicrobialTyping.json";
import { SerovarBarChart } from "../SerovarBarChart";
import { OTHER_SEROVARS, type SerovarChart } from "../serovarChart";

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

describe("SerovarBarChart colours", () => {
    // Ten serovars plus "Other", the most the chart ever draws.
    const serovars = [
        ...Array.from({ length: 10 }, (_, index) => `S. Serovar${index + 1}`),
        OTHER_SEROVARS,
    ];
    const ELEVEN_SERIES: SerovarChart = {
        serovars,
        bars: [
            {
                key: "o|m|st",
                sampleOrigin: "Broilers",
                matrix: "Fresh meat",
                samplingStage: "Retail",
                n: 110,
                shares: Object.fromEntries(serovars.map((s) => [s, 100 / 11])),
            },
        ],
        belowMinimum: [],
    };

    /** Each legend entry's text, paired with its icon's fill. */
    function legendFills(container: HTMLElement): [string, string][] {
        return Array.from(
            container.querySelectorAll(".recharts-legend-item")
        ).map((item) => [
            item.textContent ?? "",
            (
                item
                    .querySelector(".recharts-legend-icon")
                    ?.getAttribute("fill") ?? ""
            ).toLowerCase(),
        ]);
    }

    it("uses the prism palette in rank order, grey for other serovars (#1953)", () => {
        mockStrings = typingEn;

        const { container } = render(<SerovarBarChart chart={ELEVEN_SERIES} />);

        expect(legendFills(container)).toEqual([
            ["S. Serovar1", "#5f4690"],
            ["S. Serovar2", "#1d6996"],
            ["S. Serovar3", "#38a6a5"],
            ["S. Serovar4", "#0f8554"],
            ["S. Serovar5", "#73af48"],
            ["S. Serovar6", "#edad08"],
            ["S. Serovar7", "#e17c05"],
            ["S. Serovar8", "#cc503e"],
            ["S. Serovar9", "#94346e"],
            ["S. Serovar10", "#6f4070"],
            [typingEn.OtherSerovars, "#666666"],
        ]);
    });
});

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
