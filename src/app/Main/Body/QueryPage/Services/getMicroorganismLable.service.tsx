import React from "react";
import {
    MicroorganismLabelKey,
    microorganismLabels,
} from "../../../../Shared/Model/MicroorganismNames.model";

export function getMicroorganismLabelService(
    key: MicroorganismLabelKey
): JSX.Element {
    let microorganismLabel: JSX.Element = <span />;
    if (
        key === "Campylobacter spp" ||
        key === "Salmonella spp" ||
        key === "Enterococcus spp"
    ) {
        microorganismLabel = (
            <span>
                {microorganismLabels[key]}
                {microorganismLabels.spp}
            </span>
        );
    } else if (key === "ESBL/AmpC-E coli" || key === "CARBA-E coli") {
        microorganismLabel = (
            <span>
                {microorganismLabels[key]}
                {microorganismLabels["E coli"]}
            </span>
        );
    } else {
        microorganismLabel = <span>{microorganismLabels[key]}</span>;
    }
    return microorganismLabel;
}
