export type DbCollection = {
    microorganism: string;
    samplingContext: string;
    matrix: string;
}[];

export type DbKey = "microorganism" | "samplingContext" | "matrix";

export const DbValues: DbKey[] = ["microorganism", "samplingContext", "matrix"];
