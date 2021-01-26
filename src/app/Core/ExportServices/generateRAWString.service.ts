import { DBentry, DBkey } from "../../Shared/Model/Isolate.model";
import { generateCSVString } from "./generateCSVString.service";

/**
 * @desc Returns the table header and the filtered dataset as string to save it as csv
 * @param {DBkey[]} rawKeys - keys of the dataset
 * @param {DBentry} rawData - dataset
 * @returns {string} - dataset as string
 */
export function RAWDataStringGenerator(
    rawKeys: DBkey[],
    rawData: DBentry
): string {
    const RAWDataString: string[] = [];
    const headers: DBkey[] = rawKeys;
    RAWDataString.push(headers.join(","));
    RAWDataString.push(generateCSVString(rawData, headers));

    return RAWDataString.join("\n");
}
