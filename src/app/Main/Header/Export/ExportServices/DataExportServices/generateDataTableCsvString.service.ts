import {
    DbCollection,
    DbKey,
    resistancesCollection,
} from "../../../../../Shared/Model/Client_Isolate.model";
import { FilterType } from "../../../../../Shared/Model/Filter.model";
import { generateDataRowsCsvString } from "./generateDataRowsCsvString.service";

/**
 * @desc Returns the table header and the filtered dataset as string to save it as csv
 * @param data - dataset
 * @param keys - keys of the dataset
 * @param mainFilterLabels - Obj with translated labels for the table header
 * @param mainFilterAttributes - keys to get matching mainFilterLabel
 * @returns {string} - dataset as string
 */
export function generateDataTableCsvString(
    data: DbCollection,
    keys: DbKey[],
    mainFilterLabels: Record<FilterType, string>,
    mainFilterAttributes: string[]
): string {
    const FilteredDataString: string[] = [];
    const headerArray: string[] = mainFilterAttributes
        .filter((mainFilter) => mainFilter !== "resistance")
        .map((element) => mainFilterLabels[element]);
    const headerArrayWithResistances = headerArray.concat(resistancesCollection);
    FilteredDataString.push(headerArrayWithResistances.join(","));
    FilteredDataString.push(generateDataRowsCsvString(data, keys));

    return FilteredDataString.join("\n");
}
