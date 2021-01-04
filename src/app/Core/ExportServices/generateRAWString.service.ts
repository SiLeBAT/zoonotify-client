import { DBentry, DBtype } from "../../Shared/Model/Isolat.model";
import { generateCSVString } from "./generateCSVString.service";

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
