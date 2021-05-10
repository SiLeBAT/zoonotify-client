import { AmrsTableData } from "./Amrs/createAmrsTableData.service";

export interface TableData {
    title: string;
    description: string;
    tableHeader: string[];
    tableRows: AmrsTableData[];
    commentText: string;
}


export type AmrKeyType = "coliSalm" | "coliSalmTwo" | "campy" | "mrsa" | "ef"
