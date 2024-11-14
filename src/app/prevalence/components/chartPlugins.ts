import { Chart as ChartJS } from "chart.js";
import { getFormattedDate } from "./utils";

const logoImage = new Image();
logoImage.src = "/assets/bfr_logo.png";

export const logoPlugin = {
    id: "logoPlugin",
    beforeInit: (chart: ChartJS) => {
        if (!logoImage.complete) {
            logoImage.onload = () => {
                chart.update();
            };
        }
    },
    beforeDraw: (chart: ChartJS) => {
        const ctx = chart.ctx;
        ctx.save();
        ctx.globalCompositeOperation = "destination-over";
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
    },
    afterDraw: (chart: ChartJS) => {
        if (logoImage.complete) {
            const ctx = chart.ctx;
            const extraPadding = 20;
            const logoWidth = 60;
            const logoHeight = 27;

            const logoX = chart.chartArea.left + 10;
            const logoY = chart.chartArea.bottom + extraPadding + 10;

            ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);

            // Access the translated text from chart options
            const generatedOnText =
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ((chart.options.plugins as any)?.customTexts
                    ?.generatedOn as string) || "Generated on";
            const dateText = `${generatedOnText}: ${getFormattedDate()}`;

            ctx.font = "10px Arial";
            ctx.fillStyle = "#000";
            ctx.textAlign = "right";
            ctx.fillText(dateText, chart.width - 10, chart.height - 5);
        }
    },
};

export const errorBarTooltipPlugin = {
    id: "customErrorBarsTooltip",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    afterEvent: (chart: ChartJS, args: { event: any }) => {
        const { event } = args;
        const tooltip = chart.tooltip;
        const mouseX = event.x;
        const mouseY = event.y;

        chart.data.datasets.forEach((dataset, datasetIndex) => {
            const meta = chart.getDatasetMeta(datasetIndex);
            meta.data.forEach((bar, index) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const dataPoint = dataset.data[index] as any;
                if (dataPoint && (dataPoint.ciMin || dataPoint.ciMax)) {
                    const xMin = chart.scales.x.getPixelForValue(
                        dataPoint.ciMin
                    );
                    const xMax = chart.scales.x.getPixelForValue(
                        dataPoint.ciMax
                    );
                    const y = bar.y;

                    if (
                        mouseX >= xMin &&
                        mouseX <= xMax &&
                        Math.abs(mouseY - y) < 5
                    ) {
                        if (
                            tooltip &&
                            typeof tooltip.setActiveElements === "function"
                        ) {
                            tooltip.setActiveElements(
                                [
                                    {
                                        datasetIndex,
                                        index,
                                    },
                                ],
                                { x: mouseX, y: mouseY }
                            );
                        }
                    }
                }
            });
        });

        // No need to reset the tooltip's active elements when not over an error bar
        // This allows the default tooltip behavior to function when hovering over the bars
    },
};

export const drawErrorBars = (chart: ChartJS): void => {
    const ctx = chart.ctx;
    chart.data.datasets.forEach((dataset, i) => {
        const meta = chart.getDatasetMeta(i);
        meta.data.forEach((bar, index) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dataPoint = dataset.data[index] as any;
            if (dataPoint && (dataPoint.ciMin || dataPoint.ciMax)) {
                const xMin = chart.scales.x.getPixelForValue(dataPoint.ciMin);
                const xMax = chart.scales.x.getPixelForValue(dataPoint.ciMax);
                const y = bar.y;

                ctx.save();
                ctx.strokeStyle = "black";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(xMin, y);
                ctx.lineTo(xMax, y);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(xMin, y - 5);
                ctx.lineTo(xMin, y + 5);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(xMax, y - 5);
                ctx.lineTo(xMax, y + 5);
                ctx.stroke();

                ctx.restore();
            }
        });
    });
};
