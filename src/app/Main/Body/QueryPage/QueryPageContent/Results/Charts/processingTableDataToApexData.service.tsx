import { TFunction } from "i18next";
import { ApexChartData } from "./ApexChart.model";
import { replaceAll } from "../../../../../../Core/replaceAll.service";

export function processingTableDataToApexData(
    data: Record<string, string>[],
    dataLabels: string[],
    yAttribute: string,
    xAttribute: string,
    isSubFilter: boolean,
    t: TFunction
): ApexChartData {
    const apexChartSeries = [] as ApexChartData["series"];

    data.forEach((tableRow) => {
        const seriesValues: number[] = [];
        dataLabels.forEach((xLabel) => {
            seriesValues.push(Number.parseFloat(tableRow[xLabel]));
        });
        let seriesLabel = t("Results.NrIsolatesText");
        if (xAttribute !== "") {
            if (isSubFilter) {
                const filterValueWithNoDot = replaceAll(
                    tableRow.name,
                    ".",
                    "-"
                );
                const filterValueToTranslate = replaceAll(
                    filterValueWithNoDot,
                    ":",
                    ""
                );
                seriesLabel = t(
                    `Subfilters.${xAttribute}.values.${filterValueToTranslate}`
                );
            } else {
                const seriesLabelKey = tableRow.name.replace(".", "");
                seriesLabel = t(`FilterValues.${xAttribute}.${seriesLabelKey}`);
            }
        }

        const seriesData = {
            name: seriesLabel,
            data: seriesValues,
        };
        apexChartSeries.push(seriesData);
    });

    let newDataLabels = [t("Results.NrIsolatesText")];
    if (yAttribute !== "") {
        const translatedDataLabels: string[] = [];
        dataLabels.forEach((dataLabel) => {
            const dataLabelKey = dataLabel.replace(".", "");
            translatedDataLabels.push(
                t(`FilterValues.${yAttribute}.${dataLabelKey}`)
            );
        });
        newDataLabels = translatedDataLabels;
    }

    return {
        series: apexChartSeries,
        dataLabels: newDataLabels,
    };
}
