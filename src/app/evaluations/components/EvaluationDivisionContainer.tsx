import React from "react";
import { DivisionData } from "../model/Evaluations.model";
import { EvaluationDivisionDataComponent } from "./EvaluationDivisionData";
import { EvaluationDivisionHeaderComponent } from "./EvaluationDivisionHeader";

type EvaluationDivisionContainerProps = {
    title: string;
    divisionData: DivisionData;
    downloadButtonText: string;
};

export function EvaluationDivisionContainer({
    title,
    divisionData,
    downloadButtonText,
}: EvaluationDivisionContainerProps): JSX.Element {
    return (
        <div key={`main-category-${title}`}>
            <EvaluationDivisionHeaderComponent
                divisionTitle={title}
            ></EvaluationDivisionHeaderComponent>

            <EvaluationDivisionDataComponent
                data={divisionData}
                downloadButtonText={downloadButtonText}
            ></EvaluationDivisionDataComponent>
        </div>
    );
}
