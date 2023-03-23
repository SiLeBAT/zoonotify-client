import React from "react";
import { DivisionData } from "../model/Evaluations.model";
import { EvaluationDivisionDataComponent } from "./EvaluationDivisionData";
import { EvaluationDivisionHeaderComponent } from "./EvaluationDivisionHeader";

type EvaluationDivisionContainerProps = {
    divisionData: DivisionData;
    downloadButtonText: string;
};

export function EvaluationDivisionContainer({
    divisionData,
    downloadButtonText,
}: EvaluationDivisionContainerProps): JSX.Element {
    return (
        <div key={`main-category-${divisionData.title}`}>
            <EvaluationDivisionHeaderComponent
                divisionTitle={divisionData.title}
            ></EvaluationDivisionHeaderComponent>

            <EvaluationDivisionDataComponent
                data={divisionData.data}
                downloadButtonText={downloadButtonText}
            ></EvaluationDivisionDataComponent>
        </div>
    );
}
