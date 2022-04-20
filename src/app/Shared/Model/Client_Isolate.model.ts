export type Resistances =
    | "AMP"
    | "AZI"
    | "CHL"
    | "CIP"
    | "CLI"
    | "COL"
    | "DAP"
    | "ERY"
    | "ETP"
    | "F/C"
    | "FEP"
    | "FOT"
    | "FOX"
    | "FUS"
    | "GEN"
    | "IMI"
    | "KAN"
    | "LZD"
    | "MERO"
    | "MUP"
    | "NAL"
    | "PEN"
    | "RIF"
    | "SMX"
    | "STR"
    | "SYN"
    | "T/C"
    | "TAZ"
    | "TEC"
    | "TET"
    | "TGC"
    | "TIA"
    | "TMP"
    | "TRM"
    | "VAN";

export const resistancesCollection: Resistances[] = [
    "AMP",
    "AZI",
    "CHL",
    "CIP",
    "CLI",
    "COL",
    "DAP",
    "ERY",
    "ETP",
    "F/C",
    "FEP",
    "FOT",
    "FOX",
    "FUS",
    "GEN",
    "IMI",
    "KAN",
    "LZD",
    "MERO",
    "MUP",
    "NAL",
    "PEN",
    "RIF",
    "SMX",
    "STR",
    "SYN",
    "T/C",
    "TAZ",
    "TEC",
    "TET",
    "TGC",
    "TIA",
    "TMP",
    "TRM",
    "VAN",
];

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
    | "resistance"
    | "characteristics"
    | "matrixDetail";

export type DbKeyExcludeResistance = Exclude<DbKey, "resistance">;
export type DbKeyWithStringValue = Exclude<
    DbKeyExcludeResistance,
    "characteristics"
>;

export type DbCollection = (Record<DbKeyWithStringValue, string> & {
    resistance: Record<Resistances, boolean>;
} & {
    characteristics: Record<string, string>;
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

export const matrixSubFilterList: string[] = [
    "matrixDetail__Blinddarminhalt",
    "matrixDetail__Frisches Fleisch ",
    "matrixDetail__Haut",
    "matrixDetail__Kot",
    "matrixDetail__Kot / Staub",
    "matrixDetail__Rohmilchkäse",
    "matrixDetail__Streichfähige Rohwürste",
    "matrixDetail__Ölsaaten / Ölfruchte und Extraktionsschrote",
];

export const genesCollection: string[] = ["stx1", "stx2", "eae", "e_hly"];

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

export const resistanceSubFiltersList = [
    "resistance__CARBA-E. coli",
    "resistance__Campylobacter spp.",
    "resistance__E. coli",
    "resistance__ESBL/AmpC-E. coli",
    "resistance__Enterococcus spp.",
    "resistance__Listeria monocytogenes",
    "resistance__MRSA",
    "resistance__STEC",
    "resistance__Salmonella spp.",
];

export const allSubFiltersList = microorganismSubFiltersList
    .concat(matrixSubFiltersList)
    .concat(resistanceSubFiltersList);

export const allFiltersList: (string | DbKey)[] =
    allSubFiltersList.concat(mainFilterList);

export type ClientIsolateCountedGroups = (Record<string, string> & {
    count: number;
})[];

export interface ClientIsolateCounted {
    totalNumberOfIsolates: number;
    groups: ClientIsolateCountedGroups;
}
