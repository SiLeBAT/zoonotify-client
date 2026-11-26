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

describe("SerovarBarChart Listeria serogroups (#1955)", () => {
    const serogroups = ["IIa", "IIb", "IIc", "IVa", "IVb", "IVc"];
    const SEROGROUP_CHART: SerovarChart = {
        serovars: serogroups,
        bars: [
            {
                key: "o|m|st",
                sampleOrigin: "Wild ruminants",
                matrix: "Fresh meat",
                samplingStage: "Retail",
                n: 34,
                shares: Object.fromEntries(
                    serogroups.map((s) => [s, 100 / serogroups.length])
                ),
            },
        ],
        belowMinimum: [],
    };

    it("gives each serogroup the prism colour nearest the report's, in roman", () => {
        mockStrings = typingEn;

        const { container } = render(
            <SerovarBarChart
                chart={SEROGROUP_CHART}
                organism="Listeria monocytogenes"
            />
        );

        expect(legendFills(container)).toEqual([
            ["IIa", "#edad08"],
            ["IIb", "#e17c05"],
            ["IIc", "#73af48"],
            ["IVa", "#38a6a5"],
            ["IVb", "#1d6996"],
            // not in the report: the first prism colour no serogroup holds
            ["IVc", "#5f4690"],
        ]);
        expect(legendItalic(container, "IIa")).toBe(false);
    });
});

describe("SerovarBarChart MRSA clonal groups (#1956)", () => {
    const mrsaChart = (groups: string[]): SerovarChart => ({
        serovars: groups,
        bars: [
            {
                key: "o|m|st",
                sampleOrigin: "Fattening turkeys",
                matrix: "Fresh meat",
                samplingStage: "Retail",
                n: 103,
                shares: Object.fromEntries(
                    groups.map((g) => [g, 100 / groups.length])
                ),
            },
        ],
        belowMinimum: [],
    });

    it.each([
        ["en", "other CC398"],
        ["de", "andere CC398"],
    ])(
        "gives each clonal group the prism colour nearest the report's (%s), in roman",
        (_language, otherCc398) => {
            mockStrings = typingEn;

            const { container } = render(
                <SerovarBarChart
                    chart={mrsaChart([
                        "CC398 t011",
                        "CC398 t034",
                        otherCc398,
                        "non CC398",
                    ])}
                    organism="MRSA"
                />
            );

            expect(legendFills(container)).toEqual([
                ["CC398 t011", "#38a6a5"],
                ["CC398 t034", "#1d6996"],
                [otherCc398, "#5f4690"],
                ["non CC398", "#cc503e"],
            ]);
            expect(legendItalic(container, "CC398 t011")).toBe(false);
        }
    );
});

describe("SerovarBarChart Enterococcus species (#1957)", () => {
    it("gives each species the report's colour from prism, in italics", () => {
        mockStrings = typingEn;
        const species = ["Enterococcus faecalis", "Enterococcus faecium"];

        const { container } = render(
            <SerovarBarChart
                chart={{
                    serovars: species,
                    bars: [
                        {
                            key: "o|m|st",
                            sampleOrigin: "Calves",
                            matrix: "Caecal content",
                            samplingStage: "Slaughterhouse",
                            n: 179,
                            shares: {
                                "Enterococcus faecalis": 48.6,
                                "Enterococcus faecium": 51.4,
                            },
                        },
                    ],
                    belowMinimum: [],
                }}
                organism="Enterococcus spp."
            />
        );

        expect(legendFills(container)).toEqual([
            ["Enterococcus faecalis", "#1d6996"],
            ["Enterococcus faecium", "#edad08"],
        ]);
        expect(legendItalic(container, "Enterococcus faecalis")).toBe(true);
        expect(legendItalic(container, "Enterococcus faecium")).toBe(true);
    });
});

describe("SerovarBarChart x-axis", () => {
    it.each([
        [
            "Enterococcus spp.",
            "en",
            typingEn,
            "Proportion of Enterococcus spp. isolates (%)",
            "Enterococcus",
        ],
        [
            "Enterococcus spp.",
            "de",
            typingDe,
            "Anteil Enterococcus spp. Isolate (%)",
            "Enterococcus",
        ],
        [
            "Listeria monocytogenes",
            "en",
            typingEn,
            "Proportion of Listeria monocytogenes isolates (%)",
            "Listeria monocytogenes",
        ],
        [
            "Listeria monocytogenes",
            "de",
            typingDe,
            "Anteil Listeria monocytogenes Isolate (%)",
            "Listeria monocytogenes",
        ],
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

    it.each([
        ["en", typingEn, "Proportion of MRSA isolates (%)"],
        ["de", typingDe, "Anteil MRSA Isolate (%)"],
    ])(
        "names the proportion of MRSA isolates, in roman (%s)",
        (_, strings, label) => {
            mockStrings = strings;

            const { container } = render(
                <SerovarBarChart chart={CHART} organism="MRSA" />
            );

            const axisLabel = svgText(container, label);
            expect(axisLabel).toBeDefined();
            expect(
                axisLabel?.querySelector('[font-style="italic"]')
            ).toBeNull();
        }
    );
});
