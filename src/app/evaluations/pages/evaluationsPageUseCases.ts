import { useTranslation } from "react-i18next";

const useEvaluationPageComponent = (): {
    model: {
        mainHeading: string;
        sideBarTitle: string;
    };
} => {
    const { t } = useTranslation(["ExplanationPage"]);

    return {
        model: {
            mainHeading: t("Heading"),
            sideBarTitle: t("Filter_Settings"),
        },
    };
};

export { useEvaluationPageComponent };
