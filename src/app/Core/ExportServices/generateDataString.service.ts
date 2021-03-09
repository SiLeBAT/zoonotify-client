import { MainFilterLabelInterface } from "../../Shared/Model/Export.model";
import {
    DbCollection,
    DbKey,
    DbStringKey,
    ResistantValues,
} from "../../Shared/Model/Client_Isolate.model";
import { modifyTableDataStringService } from "./modifyTableDataString.service";

/**
 * @desc Transform the data to a string for the CSV file. Elements of one row are separated by comma.
 * @param {Record<string, string>[]} dataArray - data object to export in a csv file
 * @param {k[]} headers - keys of the data
 * @returns {string} - data in one csv string
 */
function generateDataCSVString(
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

/**
 * @desc Returns the table header and the filtered dataset as string to save it as csv
 * @param {string[]} keys - keys of the dataset
 * @param {Record<string, string>[]} data - dataset
 * @returns {string} - dataset as string
 */
export function generateDataString(
    data: DbCollection,
    keys: DbKey[], 
    mainFilterLabels: MainFilterLabelInterface,
    mainFilterAttributes: string[],
): string {
    const FilteredDataString: string[] = [];
    const headerArray: string[] = []
    mainFilterAttributes.forEach(element => {
        headerArray.push(mainFilterLabels[element])
    });
    FilteredDataString.push(headerArray.join(","));
    FilteredDataString.push(generateDataCSVString(data, keys));

    return FilteredDataString.join("\n");
}
