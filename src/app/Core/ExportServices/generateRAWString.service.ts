import { generateCSVString } from "./generateCSVString.service";

/**
 * @desc Returns the table header and the filtered dataset as string to save it as csv
 * @param {string[]} rawKeys - keys of the dataset
 * @param {Record<string, string>[]} rawData - dataset
 * @returns {string} - dataset as string
 */
export function RAWDataStringGenerator(
    rawKeys: string[],
    rawData: Record<string, string>[]
): string {
    const RAWDataString: string[] = [];
    const headers: string[] = rawKeys;
    RAWDataString.push(headers.join(","));
    RAWDataString.push(generateCSVString(rawData, headers));

    return RAWDataString.join("\n");
}
