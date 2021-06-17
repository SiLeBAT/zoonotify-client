import { generateStatisticRowsCsvString } from "./generateStatisticRowsCsvString.service";

/**
 * @desc Returns the table header and the statistic table as a string to save it as CSV
 * @param tableAttributes - selected row and column
 * @param statDataSet - statistic table
 * @returns {string} - header and statistic table as string
 */
export function generateStatisticTableCsvString(
    tableAttributeNames: {
        row: string | undefined;
        column: string | undefined;
    },
    statDataSet: { statData: Record<string, string>[]; statKeys: string[] }
): string {
    const StatDataString: string[] = [];
    if (tableAttributeNames.column !== undefined) {
        StatDataString.push(`,${tableAttributeNames.column}`);
    }
    const headers: string[] = statDataSet.statKeys;

    if (tableAttributeNames.row !== undefined) {
        const headerToPrint: string[] = [...headers];
        headerToPrint[0] = tableAttributeNames.row;
        StatDataString.push(headerToPrint.join(","));
    } else {
        StatDataString.push(`,${headers.slice(1).join(",")}`);
    }

    StatDataString.push(
        generateStatisticRowsCsvString(statDataSet.statData, headers)
    );

    return StatDataString.join("\n");
}
