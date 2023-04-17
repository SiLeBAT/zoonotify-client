import { Box } from "@mui/material";
import React from "react";
import { MainComponentHeader } from "../../shared/components/MainComponentHeader";
import { EvaluationDivisionContainer } from "../components/EvaluationDivisionContainer";
import { FilterContainerComponent } from "../components/FilterContainerComponent";
import { DivisionToken } from "../model/Evaluations.model";
import { useEvaluationPageComponent } from "./evaluationsUseCases";

export function EvaluationsMainComponent(): JSX.Element {
    const { model, operations } = useEvaluationPageComponent(null);
    return (
        <Box sx={{ width: "60%", margin: "2em auto" }}>
            <MainComponentHeader
                heading={model.heading.main}
            ></MainComponentHeader>
            <FilterContainerComponent selectionConfig={model.selectionConfig} />
            <div>
                {Object.keys(model.evaluationsData)
                    .filter((value) => operations.showDivision(value))
                    .map((division) => (
                        <EvaluationDivisionContainer
                            key={division}
                            title={model.heading[division]}
                            divisionData={
                                model.evaluationsData[division as DivisionToken]
                            }
                            downloadButtonText={model.downloadButtonText}
                        ></EvaluationDivisionContainer>
                    ))}
            </div>
        </Box>
    );
}
