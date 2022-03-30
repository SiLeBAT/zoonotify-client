export type EvaluationCategory = "feed" | "animal" | "food";

export type SingleEvaluation = {
    mainTitle: string;
    accordions: { title: string; description: string; chartPath: string }[];
};
export type Evaluation = Record<EvaluationCategory, SingleEvaluation>;

export type EvaluationPaths = Record<
    EvaluationCategory,
    Record<string, string>
>;
