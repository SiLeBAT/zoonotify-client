import { modifyTableDataStringService } from "../modifyTableDataString.service";

/**
 * @desc Transform the data to a string for the CSV file. Elements of one row are separated by comma.
 * @param {Record<string, string>[]} dataArray - data object to export in a csv file
 * @param {k[]} headers - keys of the data
 * @returns {string} - data in one csv string
 */
export function generateStatisticRowsCsvString<
    T extends Record<string, string>,
    K extends keyof T
>(dataArray: T[], headers: K[]): string {
    const csvTable: string[] = [];

    dataArray.forEach((row: T) => {
        const values: string[] = headers.map((header: K) => {
            const rowValue = row[header];
            return modifyTableDataStringService(`${rowValue}`);
        });
        csvTable.push(values.join(","));
    });
    const csvTableData: string = csvTable.join("\n");
    return csvTableData;
}
