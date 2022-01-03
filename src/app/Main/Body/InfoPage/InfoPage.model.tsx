import React from "react";

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

export const microorganismNames: Record<string, JSX.Element> = {
    Salm: <i>Salmonella</i>,
    SalmSpp: (
        <span>
            <i>Salmonella</i> spp.
        </span>
    ),
    Listeria: (
        <span>
            <i>Listeria</i> (<i>L.</i>) <i>monocytogenes</i>
        </span>
    ),
    ColiFull: <i>Escherichia coli</i>,
    ColiFullE: (
        <span>
            <i>Escherichia</i> (<i>E.</i>) <i>coli</i>
        </span>
    ),
    ColiShort: <i>E. coli</i>,
    Staphy: <i>Staphylococcus aureus</i>,
    Campy: <i>Campylobacter</i>,
    CampySpp: (
        <span>
            <i>Campylobacter</i> spp.
        </span>
    ),
    CampyJeC: (
        <span>
            <i>Campylobacter</i> (<i>C.</i>) <i>jejuni</i>
        </span>
    ),
    CampyJe: <i>Campylobacter jejuni</i>,
    CampyLari: <i>Campylobacter lari</i>,
    CampyJeShort: <i>C. jejuni</i>,
    CampyColiC: (
        <span>
            <i>Campylobacter</i> (<i>C.</i>) <i>coli</i>
        </span>
    ),
    CampyColi: <i>Campylobacter coli</i>,
    CampyColiShort: <i>C. coli</i>,
    EnteroSpp: (
        <span>
            <i>Enterococcus</i> spp.
        </span>
    ),
    EnteroFaecalis: <i>Enterococcus faecalis</i>,
    EnteroFaecalisE: (
        <span>
            <i>Enterococcus</i> (<i>E.</i>) <i>faecalis</i>
        </span>
    ),
    EnteroFaecium: <i>E. faecium</i>,
    Faecalis: <i>faecalis</i>,
    Faecium: <i>faecium</i>,
    EnteroFF: <i>Enterococcus faecium/faecalis</i>,
    Gallus: <i>Gallus gallus</i>,
};
