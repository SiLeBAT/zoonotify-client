import React from "react";
import { FilterContainerComponent } from "./FilterContainerComponent";
import { useEvaluationSideComponent } from "./evaluationsSideUseCases";

export function EvaluationSideContent(): JSX.Element {
    const { model } = useEvaluationSideComponent();

    return (
        <FilterContainerComponent
            selectionConfig={model.selectionConfig}
            howToHeading={model.howToHeading}
            howToContent={model.howto}
            resetAllFilters={model.resetAllFilters}
            applyAllFilters={model.applyAllFilters}
        />
    );
}
