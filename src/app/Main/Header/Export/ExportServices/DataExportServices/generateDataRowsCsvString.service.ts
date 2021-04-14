import {
    DbCollection,
    DbKey,
} from "../../../../../Shared/Model/Client_Isolate.model";
import { modifyTableDataStringService } from "../../../../../Core/modifyTableDataString.service";

/**
 * @desc Transform the data to a string for the CSV file. Elements of one row are separated by comma.
 * @param dataArray - data object to export in a csv file
 * @param headers - keys of the data
 * @returns {string} - data in one csv string
 */
export function generateDataRowsCsvString(
    dataArray: DbCollection,
    headers: DbKey[]
): string {
    const csvTable: string[] = [];
    dataArray.forEach((row) => {
        const csvRow: string[] = [];
        headers.forEach((element) => {
            if (element !== "resistance") {
                const rowValue: string = row[element];
                csvRow.push(modifyTableDataStringService(rowValue));
            } else {
                const rowValue = row.resistance.join(";");
                csvRow.push(modifyTableDataStringService(rowValue));
            }
        });
        csvTable.push(csvRow.join(","));
    });
    const csvTableData: string = csvTable.join("\n");
    return csvTableData;
}
