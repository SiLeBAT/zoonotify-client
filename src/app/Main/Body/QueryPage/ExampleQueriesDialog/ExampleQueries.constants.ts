const exampleQuery1 =
    "?microorganism=Salmonella+spp.&samplingYear=2015&samplingYear=2018&samplingYear=2014&samplingYear=2017&samplingYear=2019&samplingYear=2016&samplingContext=Salm-Bek%C3%A4mpfung&productionType=Legehennen";

const exampleQuery2 = "?microorganism=Salmonella+spp.&samplingYear=2015";

const exampleQuery3 =
    "?microorganism=CARBA-E.+coli&row=microorganism&column=samplingYear";

export type QueryCategory = "animalSample" | "foodSample" | "feedSample";

export const exampleQueriesLists: Record<QueryCategory, string[]> = {
    animalSample: [exampleQuery1, exampleQuery2, exampleQuery3],
    foodSample: [exampleQuery1, exampleQuery2, exampleQuery3],
    feedSample: [exampleQuery1, exampleQuery2, exampleQuery3],
};
