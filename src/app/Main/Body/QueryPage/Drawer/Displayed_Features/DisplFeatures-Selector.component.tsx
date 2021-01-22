import React from "react";
import { ValueType } from "react-select";
import _ from "lodash";
import { SelectorComponent } from "../../../../../Shared/Selector.component";
import { TableType } from "../../../../../Shared/Context/TableContext";
import {
    FilterType,
} from "../../../../../Shared/Model/Filter.model";
import { generateFeatureList } from "../../../../../Core/generateFeatureList.service";

export interface FeatureSelectorProps {
    activeFeature: FilterType;
    otherFeature: FilterType;
    label: string;
    selectAttribute: FilterType | TableType;
    mainFilterAttributes: string[];
    handleChange: (
        selectedOption: ValueType<Record<string, string>>,
        keyName: FilterType | TableType
    ) => void;
}

/**
 * @desc Selector to select the displayed features in row/column
 * @param {FilterType} activeFeature - feature of the corresponding selector (row/colum)
 * @param {FilterType} otherFeature - feature of the other selector (row/column)
 * @param {string} label - label for the selector in the right language
 * @param {FilterType | TableType} selectedAttribute - "row" or "column"
 * @param {(selectedOption: ValueType<Record<string, string>>,keyName: FilterType | TableType) => void} handleChange - function to handle the change of the row/colum
 * @returns {JSX.Element} - selector component
 */
export function DisplayedFeatureSelectorComponent(
    props: FeatureSelectorProps
): JSX.Element {
    const offeredAttributes: string[] = _.difference(props.mainFilterAttributes, [
        props.otherFeature,
    ]);
    const [isNotSelect, selectedValues]: [
        boolean,
        FilterType[]
    ] = generateFeatureList(props.activeFeature);

    return (
        <SelectorComponent
            label={props.label}
            selectAttribute={props.selectAttribute}
            selectValues={offeredAttributes}
            handleChange={props.handleChange}
            selectedValues={selectedValues}
            isMulti={false}
            isNotSelect={isNotSelect}
        />
    );
}
