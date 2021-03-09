import { MainFilterLabelInterface } from "../../../Shared/Model/Export.model";
import {
    DbCollection,
    DbKey,
} from "../../../Shared/Model/Client_Isolate.model";
import { generateDataCsvString } from "./generateDataCsvString.service";

/**
 * @desc Returns the table header and the filtered dataset as string to save it as csv
 * @param {string[]} keys - keys of the dataset
 * @param {Record<string, string>[]} data - dataset
 * @param {MainFilterLabelInterface} mainFilterLabels - Obj with translated labels for the table header
 * @param {string[]} mainFilterAttributes - keys to get matching mainFilterLabel
 * @returns {string} - dataset as string
 */
export function generateDataString(
    data: DbCollection,
    keys: DbKey[],
    mainFilterLabels: MainFilterLabelInterface,
    mainFilterAttributes: string[]
): string {
    const FilteredDataString: string[] = [];
    const headerArray: string[] = [];
    mainFilterAttributes.forEach((element) => {
        headerArray.push(mainFilterLabels[element]);
    });
    FilteredDataString.push(headerArray.join(","));
    FilteredDataString.push(generateDataCsvString(data, keys));

    return FilteredDataString.join("\n");
}
