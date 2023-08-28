import React from "react";
import { DivisionData } from "../model/Evaluations.model";
import { EvaluationDivisionDataComponent } from "./EvaluationDivisionData";
import { EvaluationDivisionHeaderComponent } from "./EvaluationDivisionHeader";

type EvaluationDivisionContainerProps = {
    title: string;
    divisionData: DivisionData;
    downloadGraphButtonText: string;
    downloadDataButtonText: string;
};

export function EvaluationDivisionContainer({
    title,
    divisionData,
    downloadGraphButtonText,
    downloadDataButtonText,
}: EvaluationDivisionContainerProps): JSX.Element {
    return (
        <div key={`main-category-${title}`}>
            <EvaluationDivisionHeaderComponent
                divisionTitle={title}
            ></EvaluationDivisionHeaderComponent>

            <EvaluationDivisionDataComponent
                data={divisionData}
                downloadDataButtonText={downloadDataButtonText}
                downloadGraphButtonText={downloadGraphButtonText}
            ></EvaluationDivisionDataComponent>
        </div>
    );
}
