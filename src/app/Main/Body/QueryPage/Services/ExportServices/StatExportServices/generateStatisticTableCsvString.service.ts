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
        const index = headerToPrint.indexOf("name");
        if (index > -1) {
            headerToPrint.splice(index, 1);
        }
        headerToPrint.unshift(tableAttributeNames.row);
        StatDataString.push(headerToPrint.join(","));
    } else {
        const headerWithoutRowName: string[] = [...headers];
        const index = headerWithoutRowName.indexOf("name");
        if (index > -1) {
            headerWithoutRowName.splice(index, 1);
        }
        StatDataString.push(`,${headerWithoutRowName.join(",")}`);
    }

    StatDataString.push(
        generateStatisticRowsCsvString(statDataSet.statData, headers)
    );

    return StatDataString.join("\n");
}
