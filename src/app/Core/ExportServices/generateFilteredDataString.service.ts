import { generateCSVString } from "./generateCSVString.service";

/**
 * @desc Returns the table header and the filtered dataset as string to save it as csv
 * @param {string[]} rawKeys - keys of the dataset
 * @param {Record<string, string>[]} rawData - dataset
 * @returns {string} - dataset as string
 */
export function generateFilteredDataString(
    rawKeys: string[],
    rawData: Record<string, string>[]
): string {
    const FilteredDataString: string[] = [];
    const headers: string[] = rawKeys;
    FilteredDataString.push(headers.join(","));
    FilteredDataString.push(generateCSVString(rawData, headers));

    return FilteredDataString.join("\n");
}
