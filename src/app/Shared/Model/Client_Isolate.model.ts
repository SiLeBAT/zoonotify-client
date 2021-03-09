export type ResistantValues =
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

export type DbStringKey =
    | "microorganism"
    | "samplingContext"
    | "matrix"
    | "federalState"
    | "samplingStage"
    | "origin"
    | "category"
    | "productionType";

export type DbCollection = (Record<DbStringKey, string> & {
    resistance: ResistantValues[];
})[];

export type DbKey =
    | "microorganism"
    | "samplingContext"
    | "matrix"
    | "federalState"
    | "samplingStage"
    | "origin"
    | "category"
    | "productionType"
    | "resistance";

export const DbKeyCollection: DbKey[] = [
    "microorganism",
    "samplingContext",
    "matrix",
    "federalState",
    "samplingStage",
    "origin",
    "category",
    "productionType",
    "resistance",
];

export interface ClientIsolateCountedDTO {
    totalNumberOfIsolates: number;
    groups: (Record<string, string> & {
        count: number;
    })[];
}