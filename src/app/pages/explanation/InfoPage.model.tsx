export interface AmrsTableData {
    shortSubstance: string;
    substanceClass: string;
    amrSubstance: string;
    concentrationList: Record<
        string,
        {
            cutOff: string;
            min: string;
            max: string;
        }
    >;
}

export interface AmrsTable {
    introduction: JSX.Element;
    title: JSX.Element;
    titleString: string;
    description: string;
    tableHeader: string[];
    tableSubHeader: Record<string, string[]>;
    tableRows: AmrsTableData[];
}

export type AmrKey =
    | "table1Coli"
    | "table2Salm"
    | "table3aCampy"
    | "table3bCampy"
    | "table4Mrsa"
    | "table5Ef";

export interface MicroorgaNamePart {
    name: string;
    letter?: string;
    subname?: string;
}

export type MicroorgaName = MicroorgaNamePart;
