import {
    DbCollection,
    DbKey,
    DbStringKey,
    ResistantValues,
} from "../../../Shared/Model/Client_Isolate.model";
import { modifyTableDataStringService } from "../modifyTableDataString.service";

/**
 * @desc Transform the data to a string for the CSV file. Elements of one row are separated by comma.
 * @param {DbCollection} dataArray - data object to export in a csv file
 * @param {DbKey[]} headers - keys of the data
 * @returns {string} - data in one csv string
 */
export function generateDataCsvString(
    dataArray: DbCollection,
    headers: DbKey[]
): string {
    const csvTable: string[] = [];
    dataArray.forEach(
        (
            row: Record<DbStringKey, string> & { resistance: ResistantValues[] }
        ) => {
            const oneRow: string[] = [];
            headers.forEach((element) => {
                if (element !== "resistance") {
                    const rowValue = String(row[element]);
                    oneRow.push(modifyTableDataStringService(`${rowValue}`));
                } else {
                    const rowValue = row.resistance.join(";");
                    oneRow.push(modifyTableDataStringService(`${rowValue}`));
                }
            });
            csvTable.push(oneRow.join(","));
        }
    );
    const csvTableData: string = csvTable.join("\n");
    return csvTableData;
}
