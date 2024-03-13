import { useTranslation } from "react-i18next";
import { Evaluation } from "../model/Evaluations.model";
import { useEvaluationData } from "./EvaluationDataContext";

const useEvaluationContentComponent = (): {
    model: {
        downloadDataButtonText: string;
        downloadGraphButtonText: string;
        heading: string;
        evaluationsData: Evaluation;
        loading: boolean;
    };
    operations: {
        showDivision: (div: string) => boolean;
    };
} => {
    const { t } = useTranslation(["ExplanationPage"]);
    const evaluationContext = useEvaluationData();

    return {
        model: {
            downloadDataButtonText: t("Data_Download"),
            downloadGraphButtonText: t("Export"),
            heading: t("Heading"),
            evaluationsData: evaluationContext.evaluationsData,
            loading: evaluationContext.isLoading,
        },
        operations: {
            showDivision: evaluationContext.showDivision,
        },
    };
};

export { useEvaluationContentComponent };
