import React from "react";
import { getMicroorgaNameAsHtml } from "./getMicroorgaName.service";

export const birdSpecies: Record<string, JSX.Element> = {
    Gallus: <i>Gallus gallus</i>,
};

export const salmSpp = getMicroorgaNameAsHtml("spp", "Salm");
export const enteroSpp = getMicroorgaNameAsHtml("spp", "EnteroFaecalis");
export const campySpp = getMicroorgaNameAsHtml("spp", "Campy");
export const faecalis = getMicroorgaNameAsHtml("fullName", "Faecalis");
export const faecium = getMicroorgaNameAsHtml("fullName", "Faecium");
export const campy = getMicroorgaNameAsHtml("fullName", "Campy");
export const staphy = getMicroorgaNameAsHtml("fullName", "Staphy");
export const coliFull = getMicroorgaNameAsHtml("fullName", "Coli");
export const listeria = getMicroorgaNameAsHtml("fullName", "Listeria");
export const enteroFF = getMicroorgaNameAsHtml("fullName", "EnteroFF");
export const salm = getMicroorgaNameAsHtml("fullName", "Salm");
export const campyJe = getMicroorgaNameAsHtml("fullName", "CampyJe");
export const campyColi = getMicroorgaNameAsHtml("fullName", "CampyColi");
export const campyLari = getMicroorgaNameAsHtml("fullName", "CampyLari");
export const enteroFaecium = getMicroorgaNameAsHtml(
    "fullName",
    "EnteroFaecium"
);
export const enteroFaecalis = getMicroorgaNameAsHtml(
    "fullName",
    "EnteroFaecalis"
);
export const campyJeC = getMicroorgaNameAsHtml("withAbbreviation", "CampyJe");
export const campyColiC = getMicroorgaNameAsHtml(
    "withAbbreviation",
    "CampyColi"
);
export const coliFullE = getMicroorgaNameAsHtml("withAbbreviation", "Coli");
export const enteroFaecalisE = getMicroorgaNameAsHtml(
    "withAbbreviation",
    "EnteroFaecalis"
);
export const coliShort = getMicroorgaNameAsHtml("shortName", "Coli");
export const campyJeShort = getMicroorgaNameAsHtml("shortName", "CampyJe");
export const campyColiShort = getMicroorgaNameAsHtml("shortName", "CampyJe");
