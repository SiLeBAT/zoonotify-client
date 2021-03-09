export type DbCollection = {
    microorganism: string;
    samplingContext: string;
    matrix: string;
    federalState: string;
    samplingStage: string;
    origin: string;
    category: string;
    productionType: string;
}[];

export type DbKey =
    | "microorganism"
    | "samplingContext"
    | "matrix"
    | "federalState"
    | "samplingStage"
    | "origin"
    | "category"
    | "productionType"

export const DbKeyCollection: DbKey[] = [
    "microorganism",
    "samplingContext",
    "matrix",
    "federalState",
    "samplingStage",
    "origin",
    "category",
    "productionType",
];

export interface ClientIsolateCountedDTO {
    totalNumberOfIsolates: number;
    groups: (Record<string, string> & {
        count: number;
    })[];
}