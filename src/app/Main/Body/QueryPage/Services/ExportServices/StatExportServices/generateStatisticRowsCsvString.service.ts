import { modifyTableDataStringService } from "../../../../../../Core/modifyTableDataString.service";

/**
 * @desc Transform the data to a string for the CSV file. Elements of one row are separated by comma.
 * @param dataArray - data object to export in a csv file
 * @param headers - keys of the data
 * @returns {string} - data in one csv string
 */
export function generateStatisticRowsCsvString<
    T extends Record<string, string>,
    K extends keyof T
>(dataArray: T[], headers: K[]): string {
    const csvTable: string[] = [];

    dataArray.forEach((row: T) => {
        const rowValues: string[] = [];
        headers.forEach((header) => {
            if (header === "name") {
                rowValues.unshift(modifyTableDataStringService(row.name));
            } else {
                const rowValue = row[header];
                rowValues.push(modifyTableDataStringService(`${rowValue}`));
            }
        });
        csvTable.push(rowValues.join(","));
    });
    const csvTableData: string = csvTable.join("\n");
    return csvTableData;
}
