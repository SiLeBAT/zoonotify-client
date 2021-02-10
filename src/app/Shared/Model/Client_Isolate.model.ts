export type DbCollection = {
    microorganism: string;
    sContext: string;
    matrix: string;
}[];

export type DbKey = "microorganism" | "sContext" | "matrix";

export const DbKeyCollection: DbKey[] = ["microorganism", "sContext", "matrix"];
