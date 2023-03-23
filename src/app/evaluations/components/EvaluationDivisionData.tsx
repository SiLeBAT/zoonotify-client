import React from "react";
import { ZNAccordion } from "../../shared/components/accordion/ZNAccordion";
import { EvaluationEntry } from "../model/Evaluations.model";
import { EvaluationsCardComponent } from "./EvaluationCardComponent";

type EvaluationDivisionDataProps = {
    data: EvaluationEntry[];
    downloadButtonText: string;
};

export function EvaluationDivisionDataComponent({
    data,
    downloadButtonText,
}: EvaluationDivisionDataProps): JSX.Element {
    return (
        <div>
            {data.map((evaluation) => (
                <ZNAccordion
                    key={`accordion-${evaluation.title}`}
                    title={evaluation.title}
                    content={
                        <EvaluationsCardComponent
                            title={evaluation.title}
                            description={evaluation.description}
                            chartPath={evaluation.chartPath}
                            downloadButtonText={downloadButtonText}
                        />
                    }
                    defaultExpanded={false}
                    centerContent
                />
            ))}
        </div>
    );
}
