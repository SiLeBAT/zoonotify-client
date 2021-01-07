import { DBentry, DBtype } from "../../Shared/Model/Isolat.model";
import { generateCSVString } from "./generateCSVString.service";

/**
 * @desc Resturns the table header and the filtered dataset as string to save it as csv
 * @param {DBtype[]} rawKeys - keys of the dataset
 * @param {DBentry[]} rawData - dateset
 * @returns {string} - dataset as string
 */
export function RAWDataStringGenerator(
    rawKeys: DBtype[],
    rawData: DBentry[]
): string {
    const RAWDataString: string[] = [];
    const headers: DBtype[] = rawKeys;
    RAWDataString.push(headers.join(","));
    RAWDataString.push(generateCSVString(rawData, headers));

    return RAWDataString.join("\n");
}
