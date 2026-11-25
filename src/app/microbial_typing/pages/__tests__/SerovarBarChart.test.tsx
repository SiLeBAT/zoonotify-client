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

/** Each legend entry's text, paired with its icon's fill. */
function legendFills(container: HTMLElement): [string, string][] {
    return Array.from(container.querySelectorAll(".recharts-legend-item")).map(
        (item) => [
            item.textContent ?? "",
            (
                item
                    .querySelector(".recharts-legend-icon")
                    ?.getAttribute("fill") ?? ""
            ).toLowerCase(),
        ]
    );
}

/** Whether the legend entry reading `name` is set in italics. */
function legendItalic(container: HTMLElement, name: string): boolean {
    const item = Array.from(
        container.querySelectorAll(".recharts-legend-item")
    ).find((element) => element.textContent === name);
    if (!item) throw new Error(`no legend entry "${name}"`);
    return Array.from(item.querySelectorAll("*")).some(
        (element) => window.getComputedStyle(element).fontStyle === "italic"
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

    it("uses the prism palette in rank order, grey for other serovars (#1953)", () => {
        mockStrings = typingEn;

        const { container } = render(
            <SerovarBarChart chart={ELEVEN_SERIES} organism="Salmonella spp." />
        );

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

describe("SerovarBarChart Campylobacter species (#1954)", () => {
    // Ranked as buildSerovarChart would: most isolates first.
    const species = ["C. jejuni", "C. coli", "C. upsaliensis", "C. lari"];
    const SPECIES_CHART: SerovarChart = {
        serovars: species,
        bars: [
            {
                key: "o|m|st",
                sampleOrigin: "Broilers",
                matrix: "Caecal content",
                samplingStage: "Slaughterhouse",
                n: 224,
                shares: Object.fromEntries(species.map((s) => [s, 25])),
            },
        ],
        belowMinimum: [],
    };

    it("keeps each known species' colour from the report, whatever its rank", () => {
        mockStrings = typingEn;

        const { container } = render(
            <SerovarBarChart
                chart={SPECIES_CHART}
                organism="Campylobacter spp."
            />
        );

        expect(legendFills(container)).toEqual([
            ["C. jejuni", "#1d6996"],
            ["C. coli", "#cc503e"],
            // not in the report: the first prism colour no species holds
            ["C. upsaliensis", "#5f4690"],
            ["C. lari", "#edad08"],
        ]);
    });
    it("sets the species in italics, other species in roman", () => {
        mockStrings = typingEn;
        const chart = {
            ...SPECIES_CHART,
            serovars: [...species, OTHER_SEROVARS],
        };

        const { container } = render(
            <SerovarBarChart chart={chart} organism="Campylobacter spp." />
        );

        expect(legendItalic(container, "C. jejuni")).toBe(true);
        expect(legendItalic(container, "C. lari")).toBe(true);
        expect(legendItalic(container, typingEn.OtherSerovars)).toBe(false);
    });

    it("leaves Salmonella serovars in roman", () => {
        mockStrings = typingEn;

        const { container } = render(
            <SerovarBarChart chart={CHART} organism="Salmonella spp." />
        );

        expect(legendItalic(container, "S. Infantis")).toBe(false);
    });
});

describe("SerovarBarChart x-axis", () => {
    it.each([
        [
            "Salmonella spp.",
            "en",
            typingEn,
            "Proportion of Salmonella spp. isolates (%)",
            "Salmonella",
        ],
        [
            "Salmonella spp.",
            "de",
            typingDe,
            "Anteil Salmonella spp. Isolate (%)",
            "Salmonella",
        ],
        [
            "Campylobacter spp.",
            "en",
            typingEn,
            "Proportion of Campylobacter spp. isolates (%)",
            "Campylobacter",
        ],
        [
            "Campylobacter spp.",
            "de",
            typingDe,
            "Anteil Campylobacter spp. Isolate (%)",
            "Campylobacter",
        ],
    ])(
        "names the proportion of %s isolates, the genus in italics (%s)",
        (organism, _, strings, label, genus) => {
            mockStrings = strings;

            const { container } = render(
                <SerovarBarChart chart={CHART} organism={organism} />
            );

            const axisLabel = svgText(container, label);
            expect(axisLabel).toBeDefined();
            const italic = axisLabel?.querySelector('[font-style="italic"]');
            expect(italic?.textContent).toBe(genus);
        }
    );
});
