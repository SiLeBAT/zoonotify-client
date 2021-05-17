export interface AmrsTableData {
    substanceClass: string;
    amrSubstance: string;
    cutOffOne: string;
    cutOffTwo?: string;
    concentrationMin: string;
    concentrationMax: string;
}

export interface AmrsTable {
    title: string;
    description: string;
    tableHeader: string[];
    tableRows: AmrsTableData[];
    commentText: string;
}

export type AmrKey = "coliSalm" | "coliSalmTwo" | "campy" | "mrsa" | "ef";
