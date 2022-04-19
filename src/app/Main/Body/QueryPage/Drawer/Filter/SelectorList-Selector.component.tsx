import React from "react";
import { TFunction } from "i18next";
import {
    FilterInterface,
    FilterType,
} from "../../../../../Shared/Model/Filter.model";
import { FeatureType } from "../../../../../Shared/Context/DataContext";
import { SelectorComponent } from "../../../../../Shared/Selector.component";
import { generateSelectorObject } from "./generateSelectorObject.service";
import { SelectorValue } from "../../../../../Shared/Model/Selector.model";

export interface SelectorProps {
    dataIsLoading: boolean;
    hide: boolean;
    dataUniqueValues: FilterInterface;
    selectedFilter: FilterInterface;
    filterAttribute: FilterType;
    selectorLabel: string;
    noOptionLabel: string;
    t: TFunction;
    onChange: (
        selectedOption: { value: string; label: string }[] | null,
        keyName: FilterType | FeatureType
    ) => void;
}

/**
 * @desc Generate a new selector-element for one main filter
 * @param props
 * @return {JSX.Element} new selector-element
 */
export function SelectorListSelectorComponent(
    props: SelectorProps
): JSX.Element {
    const { filterAttribute } = props;
    const filterValues: string[] =
        props.selectedFilter.filters[filterAttribute];
    const allFilterValues: string[] =
        props.dataUniqueValues.filters[filterAttribute];

    const handleChange = (
        selectedOption: SelectorValue,
        keyName: FilterType | FeatureType
    ): void => {
        if (selectedOption !== undefined && Array.isArray(selectedOption)) {
            props.onChange(
                selectedOption as { value: string; label: string }[] | null,
                keyName
            );
        } else {
            props.onChange(null, keyName);
        }
    };

    const dropDownValuesObj: {
        value: string;
        label: string;
    }[] = generateSelectorObject(filterAttribute, allFilterValues, props.t);
    const selectedValuesObj: {
        value: string;
        label: string;
    }[] = generateSelectorObject(filterAttribute, filterValues, props.t);

    return (
        <SelectorComponent
            key={`filter-selector-${filterAttribute}`}
            label={props.selectorLabel}
            noOptionLabel={props.noOptionLabel}
            dropDownValuesObj={dropDownValuesObj}
            selectedValuesObj={selectedValuesObj}
            selectAttribute={filterAttribute}
            onChange={handleChange}
            isMulti
            isDisabled={props.dataIsLoading}
            hide={props.hide}
        />
    );
}
