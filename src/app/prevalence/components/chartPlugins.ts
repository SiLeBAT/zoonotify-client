import { Chart as ChartJS } from "chart.js";

const logoImage = new Image();
logoImage.src = "/assets/bfrr_logo.png";

export const whiteBackgroundAndLogoPlugin = (
    prevalenceUpdateDate: string | null
): {
    id: string;
    beforeDraw: (chart: ChartJS) => void;
    afterDraw: (chart: ChartJS) => void;
} => ({
    id: "whiteBackgroundAndLogoPlugin",
    beforeDraw: (chart: ChartJS): void => {
        const ctx = chart.ctx;

        // Ensure the entire canvas has a white background
        ctx.save();
        ctx.globalCompositeOperation = "destination-over";
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
    },
    afterDraw: (chart: ChartJS) => {
        const ctx = chart.ctx;

        // Define padding for logo and text
        const padding = 13;

        // Draw the logo if it has finished loading
        if (logoImage.complete) {
            const logoWidth = 78; // Logo width
            const logoHeight = 27; // Logo height

            // Position for top-right corner of the full canvas
            const logoX = chart.width - logoWidth - padding; // Right edge with padding
            const logoY = padding; // Top edge with padding

            // White rectangle behind the logo for visibility
            ctx.save();
            ctx.fillStyle = "white";
            ctx.fillRect(logoX, logoY, logoWidth, logoHeight);

            // Draw the logo
            ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
            ctx.restore();
        }

        // "Generated On" text (bottom-right corner of the full canvas)
        const generatedOnText =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (chart.options.plugins as any)?.customTexts?.generatedOn ||
            "Generated on";

        // Combine the translation key with the actual date
        const dateText = `${generatedOnText}: ${prevalenceUpdateDate || ""}`;

        ctx.font = "10px Arial";
        ctx.fillStyle = "#000";
        ctx.textAlign = "right";
        ctx.fillText(
            dateText,
            chart.width - padding,
            chart.height - padding - 14
        );
    },
});

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
