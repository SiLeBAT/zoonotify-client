import _ from "lodash";
import { ExportInterface } from "../../Shared/Model/Export.model";
import { generateCSVString } from "./generateCSVString.service";

/**
 * @desc Returns the table header and the statistic table as a string to save it as CSV
 * @param {{row: FilterType; column: FilterType;}} tableAttributes - selected row and column
 * @param {{statData: Record<string, string>[]; statKeys: string[];}} statDataSet - statistic table
 * @returns {string} - header and statistic table as string
 */
export function generateStatDataString(exportParameter: ExportInterface): string {
    const StatDataString: string[] = [];
    if (!_.isEmpty(exportParameter.tableAttributes.column)) {
        StatDataString.push(`,${exportParameter.tableAttributes.column}`);
    }
    const headers: string[] = exportParameter.statDataSet.statKeys;
    if (!_.isEmpty(exportParameter.tableAttributes.row)) {
        const headerToPrint: string[] = [...headers];
        headerToPrint[0] = exportParameter.tableAttributes.row;
        StatDataString.push(headerToPrint.join(","));
    } else {
        StatDataString.push(headers.join(","));
    }

    StatDataString.push(
        generateCSVString(exportParameter.statDataSet.statData, headers)
    );

    return StatDataString.join("\n");
}
