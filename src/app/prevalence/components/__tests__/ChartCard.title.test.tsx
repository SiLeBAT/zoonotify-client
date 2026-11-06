import React from "react";
import { render } from "@testing-library/react";
import { Chart as ChartJS, registerables } from "chart.js";
import { ChartCard } from "../ChartCard";

// Real Chart.js on jest-canvas-mock: the title is drawn on the canvas, which
// is also what "Download chart" exports, so the drawn text is the observable.
ChartJS.register(...registerables);

jest.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

// jsdom has no ResizeObserver; Chart.js needs one for responsive charts.
class NoopResizeObserver {
    observe(): void {}

    unobserve(): void {}

    disconnect(): void {}
}
global.ResizeObserver ??= NoopResizeObserver;

// jsdom does no layout, so every container measures 0×0 and Chart.js skips
// drawing; give the chart's container a size (Chart.js reads its bounding box)
// so the chart actually paints.
beforeAll(() => {
    jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
        width: 800,
        height: 600,
        top: 0,
        left: 0,
    } as DOMRect);
});

afterAll(() => jest.restoreAllMocks());

type ChartCardProps = React.ComponentProps<typeof ChartCard>;

const props = (currentMicroorganism: string): ChartCardProps => ({
    chartKey: "Test Key",
    series: [
        {
            label: "Fresh-Broiler-Meat",
            data: {
                2022: {
                    x: 15,
                    y: 2022,
                    ciMin: 10,
                    ciMax: 20,
                    numberOfSamples: 120,
                    numberOfPositive: 25,
                },
            },
        },
    ] as unknown as ChartCardProps["series"],
    chartRef: React.createRef(),
    currentMicroorganism,
    yearsToShow: [2022],
    xAxisMax: 100,
    downloadChart: jest.fn(),
    prevalenceUpdateDate: null,
});

/** jest-canvas-mock's recording API on top of the 2D context. */
interface RecordingContext {
    __getDrawCalls(): { type: string; props: { text?: string } }[];
    __clearDrawCalls(): void;
}

const canvasOf = (container: HTMLElement): RecordingContext =>
    container
        .querySelector("canvas")
        ?.getContext("2d") as unknown as RecordingContext;

/** Every text drawn on the chart's canvas since the last clear. */
const drawnTexts = (container: HTMLElement): string[] =>
    canvasOf(container)
        .__getDrawCalls()
        .filter((call) => call.type === "fillText")
        .map((call) => call.props.text ?? "");

describe("ChartCard title", () => {
    it("names the newly selected microorganism after a switch", () => {
        const first = props("Campylobacter spp.");
        const { container, rerender } = render(<ChartCard {...first} />);
        expect(drawnTexts(container)).toContain("Campylobacter");

        canvasOf(container).__clearDrawCalls();
        rerender(
            <ChartCard
                {...props("Yersinia enterocolitica")}
                chartRef={first.chartRef}
            />
        );

        const texts = drawnTexts(container);
        expect(texts).toContain("Yersinia");
        expect(texts).not.toContain("Campylobacter");
    });
});
