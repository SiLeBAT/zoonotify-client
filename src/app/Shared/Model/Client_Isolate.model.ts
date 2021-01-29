export type DbCollection = {
    microorganism: string;
    samplingContext: string;
    matrix: string;
}[];

export type DbKey = "microorganism" | "samplingContext" | "matrix";

export const DbKeyCollection: DbKey[] = ["microorganism", "samplingContext", "matrix"];
