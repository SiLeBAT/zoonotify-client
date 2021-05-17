export interface AmrsTableData {
    substanceClass: string;
    amrSubstance: string;
    cutOffOne: string;
    cutOffTwo?: string;
    concentrationMin: string;
    concentrationMax: string;
}

export type AmrsTableDataKey =
    | "substanceClass"
    | "amrSubstance"
    | "cutOffOne"
    | "cutOffTwo"
    | "concentrationMin"
    | "concentrationMax";

export interface AmrsTable {
    title: string;
    description: string;
    tableHeader: string[];
    tableRows: AmrsTableData[];
    commentText: string;
}

export type AmrKey = "coliSalm" | "coliSalmTwo" | "campy" | "mrsa" | "ef";
