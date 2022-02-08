// Feed samples
const exampleQuery1 =
    "?microorganism=Salmonella+spp.&origin=Futtermittel&row=samplingYear&column=matrix";

// animal samples
const exampleQuery2 =
    "?microorganism=E.+coli&origin=Tier&category=Schwein&productionType=Mastschwein&row=samplingYear&column=matrix";
const exampleQuery3 =
    "?microorganism=Salmonella+spp.&samplingContext=Salm-Bek%C3%A4mpfung&productionType=Legehennen&row=samplingYear&column=federalState";
const exampleQuery4 =
    "?microorganism=Salmonella+spp.&samplingContext=Salm-Bek%C3%A4mpfung&productionType=Legehennen&row=samplingYear&column=federalState";

// food samples
const exampleQuery5 =
    "?microorganism=STEC&origin=Lebensmittel&category=Pflanzliche+Lebensmittel&row=matrix&column=samplingStage";
const exampleQuery6 =
    "?microorganism=Listeria+monocytogenes&origin=Lebensmittel&category=Gefl%C3%BCgel&category=Huhn&row=productionType&column=matrix";
const exampleQuery7 =
    "?microorganism=Listeria+monocytogenes&origin=Lebensmittel&category=Meeresfr%C3%BCchte&category=S%C3%BC%C3%9Fwasserfische&row=samplingYear&column=productionType";
const exampleQuery8 =
    "?microorganism=Campylobacter+spp.&category=Huhn&category=Pute&row=productionType&column=matrix";

export type QueryCategory = "animalSample" | "foodSample" | "feedSample";

export const exampleQueriesLists: Record<QueryCategory, string[]> = {
    feedSample: [exampleQuery1],
    animalSample: [exampleQuery2, exampleQuery3, exampleQuery4],
    foodSample: [exampleQuery5, exampleQuery6, exampleQuery7, exampleQuery8],
};
