import React from "react";
import { ValueType } from "react-select";
import { TFunction } from "i18next";
import { CheckIfSingleFilterIsSet } from "../../Services/checkIfFilterIsSet.service";
import {
    FilterInterface,
    FilterType,
} from "../../../../../Shared/Model/Filter.model";
import { FeatureType } from "../../../../../Shared/Context/DataContext";
import { SelectorComponent } from "../../../../../Shared/Selector.component";
import {
    bfrDarkgrey,
    primaryColor,
} from "../../../../../Shared/Style/Style-MainTheme";
import { generateSelectorObject } from "./generateSelectorObject.service";

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
        selectedOption: ValueType<{ value: string; label: string }, boolean>,
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

    const noFilter: boolean = CheckIfSingleFilterIsSet(
        props.selectedFilter,
        filterAttribute
    );

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
            titleColor={bfrDarkgrey}
            hooverColor={primaryColor}
            hooverColorDark={bfrDarkgrey}
            label={props.selectorLabel}
            noOptionLabel={props.noOptionLabel}
            dropDownValuesObj={dropDownValuesObj}
            selectedValuesObj={selectedValuesObj}
            selectAttribute={filterAttribute}
            onChange={handleChange}
            isMulti
            isNotSelected={noFilter}
            isDisabled={props.dataIsLoading}
            hide={props.hide}
        />
    );
}
