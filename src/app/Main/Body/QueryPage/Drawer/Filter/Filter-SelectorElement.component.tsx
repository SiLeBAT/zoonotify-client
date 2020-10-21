import React, { useContext } from "react";
import { ValueType } from "react-select";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import {
    FilterType,
    mainFilterAttributes,
} from "../../../../../Shared/Filter.model";
import { TableType } from "../../../../../Shared/Context/TableContext";
import { SelectorComponent as Select } from "../../../../../Shared/Selector.component";
import { CheckIfSingleFilterIsSet } from "../../../../../Core/FilterServices/checkIfFilter.service";
import { DataContext } from "../../../../../Shared/Context/DataContext";
import { FilterContext } from "../../../../../Shared/Context/FilterContext";

interface FilterSelectorProps {
    index: number;
    handleChange: (
        selectedOption: ValueType<Record<string, string>>,
        keyName: FilterType | TableType
    ) => void;
}

/**
 * @desc generate a new selector-element
 * @param   {number}            index         number of the element
 * @param   {FilterInterface}   filter        Object with selected filters
 * @param   {FilterInterface}   uniqueValues  all possible filters;
 * @param   {( selectedOption: ValueType<Record<string, string>>b, keyName: FilterType | TableType) => void} handleChange function to handle selector change
 * @return  {JSX.Element}                     new selector-element
 */
export function SelectorElement(props: FilterSelectorProps): JSX.Element {
    const { data } = useContext(DataContext);
    const { filter } = useContext(FilterContext);
    const { t } = useTranslation(["QueryPage"]);

    const filterAttribute: FilterType = mainFilterAttributes[props.index];
    let filterValues: string[] = []
    if (!_.isEmpty(filter.selectedFilter)) {
        filterValues = filter.selectedFilter[filterAttribute];
    }
    const allFilterValues: string[] = data.uniqueValues[filterAttribute];
    const noFilter: boolean = CheckIfSingleFilterIsSet(filter.selectedFilter, filterAttribute);
    return (
        <Select
            key={`filter-selector-${filterAttribute}`}
            label={t(`Filters.${filterAttribute}`)}
            selectAttribute={filterAttribute}
            handleChange={props.handleChange}
            selectedValues={filterValues}
            selectValues={allFilterValues}
            isMulti
            isNotSelect={noFilter}
        />
    );
}
