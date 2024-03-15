import React from "react";
import { MainComponentHeader } from "../../shared/components/MainComponentHeader";

import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import { DivisionToken } from "../model/Evaluations.model";
import { EvaluationDivisionContainer } from "./EvaluationDivisionContainer";
import { useEvaluationContentComponent } from "./evaluationsContentUseCases";
// import { useTranslation } from "react-i18next";
interface EvaluationMainContentProps {
    heading: string;
}

export function EvaluationMainContent({}: EvaluationMainContentProps): JSX.Element {
    const { model, operations } = useEvaluationContentComponent();
    const { t } = useTranslation(["ExplanationPage"]);
    const headerAndFooterHeight = 64 + 80;

    return (
        <>
            <MainComponentHeader heading={model.heading}></MainComponentHeader>
            <Box
                sx={{
                    maxHeight: `calc(100vh - ${headerAndFooterHeight}px)`,
                    overflowY: "auto",
                }}
            >
                {!model.loading &&
                    Object.keys(model.evaluationsData)
                        .filter((value) => operations.showDivision(value))
                        .map((division) => (
                            <EvaluationDivisionContainer
                                key={division}
                                title={t(division)}
                                divisionData={
                                    model.evaluationsData[
                                        division as DivisionToken
                                    ]
                                }
                                downloadGraphButtonText={
                                    model.downloadGraphButtonText
                                }
                                downloadDataButtonText={
                                    model.downloadDataButtonText
                                }
                            />
                        ))}
            </Box>
        </>
    );
}
