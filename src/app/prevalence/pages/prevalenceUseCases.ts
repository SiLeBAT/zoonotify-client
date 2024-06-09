import { useTranslation } from "react-i18next";

const usePrevalencePageComponent = (): {
    model: {
        sideBarTitle: string;
        mainHeading: string;
    };
} => {
    const { t } = useTranslation(["PrevalencePage"]);

    return {
        model: {
            sideBarTitle: t("SEARCH_SETTINGS"),
            mainHeading: t("PREVALENCE"),
        },
    };
};

export { usePrevalencePageComponent };
