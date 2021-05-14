import { AmrsTableData } from "../InfoPage.model";

export function createAmrTable(
    substanceClass: string,
    amrSubstance: string,
    cutOffOne: string,
    CutOffTwo: string,
    concentrationMin: string,
    concentrationMax: string
): AmrsTableData {
    return {
        substanceClass,
        amrSubstance,
        cutOffOne,
        CutOffTwo,
        concentrationMin,
        concentrationMax,
    };
}


export function createAmrTableOneCutOff(
    substanceClass: string,
    amrSubstance: string,
    cutOff: string,
    concentrationMin: string,
    concentrationMax: string
): AmrsTableData {
    return {
        substanceClass,
        amrSubstance,
        cutOff,
        concentrationMin,
        concentrationMax,
    };
}