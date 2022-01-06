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

export const mainFilterList: DbKey[] = [
    "microorganism",
    "samplingYear",
    "samplingContext",
    "origin",
    "samplingStage",
    "category",
    "productionType",
    "matrix",
    "federalState",
];

export const microorganismSubFiltersList: string[] = [
    "serovar",
    "carba_ampc_carba_phenotype",
    "esbl_ampc_carba_phenotype",
    "campy_spez",
    "entero_spez",
    "spa_type",
    "serotype",
    "clonal_group",
    "o_group",
    "h_group",
    "genes",
];

export const matrixSubFiltersList: string[] = [
    "matrixDetail__(Hals)haut",
    "matrixDetail__(Konsum)eier, unsortiert",
    "matrixDetail__Alleinfuttermittel",
    "matrixDetail__Babyspinat",
    "matrixDetail__Blatt- und Kopfsalate",
    "matrixDetail__Blattsalate",
    "matrixDetail__Blinddarminhalt",
    "matrixDetail__Erdbeeren",
    "matrixDetail__Fleischerzeugnisse",
    "matrixDetail__Frische Kräuter",
    "matrixDetail__Frisches Fleisch",
    "matrixDetail__Garnelen",
    "matrixDetail__Getrocknete Blatt- und Grasprodukte",
    "matrixDetail__Hackfleisch",
    "matrixDetail__Haut",
    "matrixDetail__Kiemeninhalt",
    "matrixDetail__Konsumeier, sortiert",
    "matrixDetail__Kot",
    "matrixDetail__Kot / Staub",
    "matrixDetail__Muscheln",
    "matrixDetail__Muskel",
    "matrixDetail__Nasenschleimhaut",
    "matrixDetail__Nasentupfer",
    "matrixDetail__Petersilie",
    "matrixDetail__Rohmilchkäse",
    "matrixDetail__Sammelmilch",
    "matrixDetail__Schlachtkörper",
    "matrixDetail__Sprossen",
    "matrixDetail__Staub",
    "matrixDetail__Streichfähige Rohwürste",
    "matrixDetail__Tatar / Schabefleisch",
    "matrixDetail__Tomaten",
    "matrixDetail__Weizenmehl",
    "matrixDetail__Ölsaaten / Ölfruchte und Extraktionsschrote",
];

export const allSubFiltersList =
    microorganismSubFiltersList.concat(matrixSubFiltersList);

export const allFiltersList: (string | DbKey)[] =
    allSubFiltersList.concat(mainFilterList);

export const resistancesCollection = [
    "GEN",
    "KAN",
    "STR",
    "CHL",
    "CIP",
    "PEN",
    "FOX",
    "TMP",
    "SMX",
    "TET",
    "CLI",
    "ERY",
    "MUP",
    "RIF",
    "LZD",
    "FUS",
    "SYN",
    "TIA",
    "VAN",
    "FOT",
    "TAZ",
    "NAL",
    "AMP",
    "COL",
    "AZI",
    "TGC",
    "FEP",
    "F/C",
    "T/C",
    "ETP",
    "IMI",
    "MERO",
    "TRM",
    "DAP",
    "TEC",
];

export type ClientIsolateCountedGroups = (Record<string, string> & {
    count: number;
})[];

export interface ClientIsolateCounted {
    totalNumberOfIsolates: number;
    groups: ClientIsolateCountedGroups;
}
