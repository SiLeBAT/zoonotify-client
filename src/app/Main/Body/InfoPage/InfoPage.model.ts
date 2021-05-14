
export type AmrsTableData = Record<string, string>

export interface AmrsTable {
    title: string;
    description: string;
    tableHeader: string[];
    tableRows: AmrsTableData[];
    commentText: string;
}


export type AmrKey = "coliSalm" | "coliSalmTwo" | "campy" | "mrsa" | "ef"
