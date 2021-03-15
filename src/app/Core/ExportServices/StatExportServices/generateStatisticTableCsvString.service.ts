import _ from "lodash";
import { FilterType } from "../../../Shared/Model/Filter.model";
import { generateStatisticRowsCsvString } from "./generateStatisticRowsCsvString.service";

/**
 * @desc Returns the table header and the statistic table as a string to save it as CSV
 * @param {{row: FilterType; column: FilterType;}} tableAttributes - selected row and column
 * @param {{statData: Record<string, string>[]; statKeys: string[];}} statDataSet - statistic table
 * @returns {string} - header and statistic table as string
 */
export function generateStatisticTableCsvString(
    tableAttributes: { row: FilterType; column: FilterType },
    statDataSet: { statData: Record<string, string>[]; statKeys: string[] }
): string {
    const StatDataString: string[] = [];
    if (!_.isEmpty(tableAttributes.column)) {
        StatDataString.push(`,${tableAttributes.column}`);
    }
    const headers: string[] = statDataSet.statKeys;
    if (!_.isEmpty(tableAttributes.row)) {
        const headerToPrint: string[] = [...headers];
        headerToPrint[0] = tableAttributes.row;
        StatDataString.push(headerToPrint.join(","));
    } else {
        StatDataString.push(headers.join(","));
    }

    StatDataString.push(
        generateStatisticRowsCsvString(statDataSet.statData, headers)
    );

    return StatDataString.join("\n");
}
