export interface AmrsTableData {
    substanceClass: string;
    amrSubstance: string;
    valuesPerYearObject: Record<
        string,
        { cutOff: string; min: string; max: string }
    >;
}

export interface AmrsTable {
    introduction: JSX.Element;
    title: JSX.Element;
    titleString: string;
    description: string;
    tableHeader: string[];
    tableSubHeader: string[];
    tableRows: AmrsTableData[];
}

export type AmrKey =
    | "table1Coli"
    | "table2Salm"
    | "table3aCampy"
    | "table3bCampy"
    | "table4Mrsa"
    | "table5Ef";
