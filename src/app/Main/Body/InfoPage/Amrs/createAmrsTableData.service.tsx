export type AmrsTableData = Record<string, string>

export function createAmrTable(
    substanceClass: string,
    amSubstance: string,
    cutOffOne: string,
    cutOffTow: string,
    concentrationMin: string,
    concentrationMax: string
): AmrsTableData {
    return {
        substanceClass,
        amSubstance,
        cutOffOne,
        cutOffTow,
        concentrationMin,
        concentrationMax,
    };
}


export function createAmrTableOneCutOff(
    substanceClass: string,
    amSubstance: string,
    cutOff: string,
    concentrationMin: string,
    concentrationMax: string
): AmrsTableData {
    return {
        substanceClass,
        amSubstance,
        cutOff,
        concentrationMin,
        concentrationMax,
    };
}