import React from "react";

export interface AmrsTableData {
    substanceClass: string;
    amrSubstance: string;
    cutOffOne: string;
    cutOffTwo?: string;
    concentrationMin: string;
    concentrationMax: string;
}

export interface AmrsTable {
    introduction: JSX.Element;
    title: JSX.Element;
    titleString: string;
    description: string;
    tableHeader: string[];
    tableRows: AmrsTableData[];
    commentText: string;
}

export type AmrKey = "coliSalm" | "coliSalmTwo" | "campy" | "mrsa" | "ef";

export const microorganismNames: Record<string, JSX.Element> = {
    Salm: <i>Salmonella</i>,
    Campy: <i>Campylobacter</i>,
    Listeria: <i>Listeria monocytogenes</i>,
    ColiFull: <i>Escherichia coli</i>,
    ColiShort: <i>E. coli</i>,
    Staphy: <i>Staphylococcus aureus</i>,
    Entero: <i>Enterococcus</i>,
    CampyJeC: <i>Campylobacter (C.) jejuni</i>,
    CampyJe: <i>Campylobacter jejuni</i>,
    CampyJeShort: <i>C. jejuni</i>,
    CampyColiC: <i>Campylobacter (C.) coli</i>,
    CampyColi: <i>Campylobacter coli</i>,
    CampyColiShort: <i>C. coli</i>,
    EnteroFaecalis: <i>Enterococcus faecalis</i>,
    EnteroFaecalisE: <i>Enterococcus (E.) faecalis</i>,
    EnteroFaecium: <i>E. faecium</i>,
    Faecalis: <i>faecalis</i>,
    Faecium: <i>faecium</i>,
    EnteroFF: <i>Enterococcus faecium/faecalis</i>
};
