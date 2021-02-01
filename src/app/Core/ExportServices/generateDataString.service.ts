import { generateCSVString } from "./generateCSVString.service";

/**
 * @desc Returns the table header and the filtered dataset as string to save it as csv
 * @param {string[]} keys - keys of the dataset
 * @param {Record<string, string>[]} data - dataset
 * @returns {string} - dataset as string
 */
export function generateDataString(
    keys: string[],
    data: Record<string, string>[]
): string {
    const FilteredDataString: string[] = [];
    const headers: string[] = keys;
    FilteredDataString.push(headers.join(","));
    FilteredDataString.push(generateCSVString(data, headers));

    return FilteredDataString.join("\n");
}
