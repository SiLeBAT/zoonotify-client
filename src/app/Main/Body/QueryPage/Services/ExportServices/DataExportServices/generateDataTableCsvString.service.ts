import {
    DbCollection,
    DbKey,
    genesCollection,
    microorganismSubFiltersList,
    resistancesCollection,
} from "../../../../../../Shared/Model/Client_Isolate.model";
import { FilterType } from "../../../../../../Shared/Model/Filter.model";
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
    filteredSubFilterHeaderList: string[],
    mainFilterLabels: Record<FilterType, string>,
    subFilterLabels: Record<string, string>,
    mainFilterAttributes: string[]
): string {
    const characteristicHeader =
        microorganismSubFiltersList.concat(genesCollection);
    const filteredCharacteristicHeader = characteristicHeader.filter(
        (value) => {
            return value !== "genes";
        }
    );
    const FilteredDataString: string[] = [];

    let headerArray: string[] = mainFilterAttributes
        .filter(
            (mainFilter) =>
                mainFilter !== "resistance" && mainFilter !== "characteristic"
        )
        .map((element) => mainFilterLabels[element]);
    headerArray = headerArray.concat(
        filteredSubFilterHeaderList.map(
            (subFilter) => subFilterLabels[subFilter]
        )
    );
    headerArray = headerArray.concat(resistancesCollection);
    FilteredDataString.push(headerArray.join(","));
    FilteredDataString.push(
        generateDataRowsCsvString(data, keys, filteredCharacteristicHeader)
    );

    return FilteredDataString.join("\n");
}
