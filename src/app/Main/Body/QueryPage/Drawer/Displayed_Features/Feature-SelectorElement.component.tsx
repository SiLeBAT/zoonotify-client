import React from "react";
import { ValueType } from "react-select";
import _ from "lodash";
import { SelectorComponent as Select } from "../../../../../Shared/Selector.component";
import { TableType } from "../../../../../Shared/Context/TableContext";
import {
    FilterType,
} from "../../../../../Shared/Filter.model";
import { gernerateSettings } from "../../../../../Core/generateFeatureSettings.service";

interface FeatureSelectorProps {
    keyValue: string;
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

export function DisplayedFeatureSelectorComponent(
    props: FeatureSelectorProps
): JSX.Element {
    const offeredAttributes: string[] = _.difference(props.mainFilterAttributes, [
        props.otherFeature,
    ]);
    const [isNotSelect, selectedValues]: [
        boolean,
        FilterType[]
    ] = gernerateSettings(props.activeFeature);

    return (
        <Select
            key={props.keyValue}
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
