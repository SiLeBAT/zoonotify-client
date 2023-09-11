import React from "react";
import { MicroorgaName } from "../model/ExplanationPage.model";

export const microorgaNames: Record<string, MicroorgaName> = {
    Salm: {
        name: "Salmonella",
    },
    Listeria: {
        name: "Listeria",
        letter: "L",
        subname: "monocytogenes",
    },
    Coli: {
        name: "Escherichia",
        letter: "E",
        subname: "coli",
    },
    Staphy: {
        name: "Staphylococcus",
        subname: "aureus",
    },
    Campy: {
        name: "Campylobacter",
    },
    CampyJe: {
        name: "Campylobacter",
        letter: "C",
        subname: "jejuni",
    },
    CampyLari: {
        name: "Campylobacter",
        subname: "lari",
    },
    CampyColi: {
        name: "Campylobacter",
        letter: "C",
        subname: "coli",
    },
    EnteroFaecalis: {
        name: "Enterococcus",
        letter: "E",
        subname: "faecalis",
    },
    EnteroFaecium: {
        name: "Enterococcus",
        letter: "E",
        subname: "faecium",
    },
    Faecalis: {
        name: "faecalis",
    },
    Faecium: {
        name: "faecium",
    },
    EnteroFF: {
        name: "Enterococcus",
        subname: "faecium/faecalis",
    },
};
export function getMicroorgaNameAsHtml(
    pattern: "spp" | "shortName" | "withAbbreviation" | "fullName",
    microorga: string
): JSX.Element {
    if (pattern === "spp") {
        return (
            <span>
                <i>{microorgaNames[microorga].name}</i> spp.
            </span>
        );
    }

    if (pattern === "withAbbreviation") {
        return (
            <span>
                <i>{microorgaNames[microorga].name}</i> (
                <i>{microorgaNames[microorga].letter}</i>.){" "}
                <i>{microorgaNames[microorga].subname}</i>
            </span>
        );
    }
    if (pattern === "shortName") {
        return (
            <i>
                {microorgaNames[microorga].letter}.{" "}
                {microorgaNames[microorga].subname}
            </i>
        );
    }

    if (pattern === "fullName" && microorgaNames[microorga].subname) {
        return (
            <i>
                {microorgaNames[microorga].name}{" "}
                {microorgaNames[microorga].subname}
            </i>
        );
    }
    return <i>{microorgaNames[microorga].name}</i>;
}

export function getMicroorgaNameAsString(
    pattern: "spp" | "withAbbreviation" | "shortName" | "fullName",
    microorga: string
): string {
    if (pattern === "spp") {
        return `${microorgaNames[microorga].name} spp.`;
    }

    if (pattern === "withAbbreviation") {
        return `${microorgaNames[microorga].name} (
                ${microorgaNames[microorga].letter}.)
                ${microorgaNames[microorga].subname}`;
    }
    if (pattern === "shortName") {
        return `${microorgaNames[microorga].letter}. ${microorgaNames[microorga].subname}`;
    }
    return `${microorgaNames[microorga].name} ${microorgaNames[microorga].subname}`;
}
