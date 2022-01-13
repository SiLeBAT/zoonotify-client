const defaultQuery1 =
    "?microorganism=Salmonella+spp.&samplingYear=2015&samplingYear=2018&samplingYear=2014&samplingYear=2017&samplingYear=2019&samplingYear=2016&samplingContext=Salm-Bek%C3%A4mpfung&productionType=Legehennen";

const defaultQuery2 = "?microorganism=Salmonella+spp.&samplingYear=2015";

const defaultQuery3 =
    "?microorganism=CARBA-E.+coli&row=microorganism&column=samplingYear";

export type QueryCategories = "animalSample" | "foodSample" | "feedSample";

export const exampleQueriesLists: Record<QueryCategories, string[]> = {
    animalSample: [defaultQuery1, defaultQuery2, defaultQuery3],
    foodSample: [defaultQuery1, defaultQuery2, defaultQuery3],
    feedSample: [defaultQuery1, defaultQuery2, defaultQuery3],
};
