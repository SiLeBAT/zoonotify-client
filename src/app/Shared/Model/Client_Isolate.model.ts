export type ResistantValue =
    | "amp"
    | "azi"
    | "chl"
    | "cip"
    | "cli"
    | "col"
    | "dap"
    | "ery"
    | "etp"
    | "fep"
    | "fop"
    | "fox"
    | "fus"
    | "f_c"
    | "gen"
    | "imi"
    | "kan"
    | "lzd"
    | "mero"
    | "mup"
    | "nal"
    | "pen"
    | "rif"
    | "smx"
    | "str"
    | "syn"
    | "taz"
    | "tec"
    | "tet"
    | "tgc"
    | "tia"
    | "tmp"
    | "trm"
    | "t_c"
    | "van";

export type DbKey =
    | "microorganism"
    | "samplingContext"
    | "matrix"
    | "federalState"
    | "samplingStage"
    | "origin"
    | "category"
    | "productionType"
    | "samplingYear"
    | "resistance";

export type DbKeyWithStringValue = Exclude<DbKey, "resistance">;

export type DbCollection = (Record<DbKeyWithStringValue, string> & {
    resistance: ResistantValue[];
})[];

export const DbKeyCollection: DbKey[] = [
    "microorganism",
    "samplingContext",
    "matrix",
    "federalState",
    "samplingStage",
    "origin",
    "category",
    "productionType",
    "samplingYear",
    "resistance",
];

export type ClientIsolateCountedGroups = (Record<string, string> & {
    count: number;
})[];

export interface ClientIsolateCounted {
    totalNumberOfIsolates: number;
    groups: ClientIsolateCountedGroups;
}
