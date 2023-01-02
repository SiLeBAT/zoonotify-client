import React from "react";
// eslint-disable-next-line import/named
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { EvaluationsPageComponent } from "./EvaluationPage.component";
import { evaluationPaths } from "./Evaluations.constants";
import {
    Evaluation,
    EvaluationCategory,
    EvaluationPaths,
    SingleEvaluation,
} from "./Evaluations.model";
import { EvaluationsPageNavButtonComponent } from "./EvaluationPage-NavButtons.component";

function constructionOfEvaluationsService(
    category: EvaluationCategory,
    nrOfAccordions: number,
    t: TFunction,
    pathList: EvaluationPaths
): SingleEvaluation {
    const accordionList = [];
    for (let i = 0; i < nrOfAccordions; i += 1) {
        accordionList.push({
            title: t(`${category}.accordions.accordion_${i}.title`),
            description: t(`${category}.accordions.accordion_${i}.description`),
            chartPath: pathList[category][`path_${i}`],
        });
    }

    return {
        mainTitle: t(`${category}.mainTitle`),
        accordions: accordionList,
    };
}

export function EvaluationsPageContainerComponent(): JSX.Element {
    const { t } = useTranslation(["ExplanationPage"]);

    const downloadButtonText = t("Export");
    const heading = t("Heading");

    const evaluationsData: Evaluation = {
        feed: constructionOfEvaluationsService("feed", 0, t, evaluationPaths),
        animal: constructionOfEvaluationsService(
            "animal",
            1,
            t,
            evaluationPaths
        ),
        food: constructionOfEvaluationsService("food", 3, t, evaluationPaths),
    };

    const navButtonComponent = (
        <EvaluationsPageNavButtonComponent evaluationsData={evaluationsData} />
    );

    return (
        <EvaluationsPageComponent
            heading={heading}
            evaluationsData={evaluationsData}
            navButtonComponent={navButtonComponent}
            downloadButtonText={downloadButtonText}
        />
    );
}
