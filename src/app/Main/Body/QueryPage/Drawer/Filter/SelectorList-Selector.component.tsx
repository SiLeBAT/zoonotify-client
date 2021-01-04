import React, { useContext } from "react";
import { ValueType } from "react-select";
import { useTranslation } from "react-i18next";
import { CheckIfSingleFilterIsSet } from "../../../../../Core/FilterServices/checkIfFilter.service";
import { DataContext } from "../../../../../Shared/Context/DataContext";
import { FilterContext } from "../../../../../Shared/Context/FilterContext";
import {
    FilterType,
    mainFilterAttributes,
} from "../../../../../Shared/Model/Filter.model";
import { TableType } from "../../../../../Shared/Context/TableContext";
import { SelectorComponent as Selector } from "../../../../../Shared/Selector.component";

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
export function SelectorListSelectorComponent(props: FilterSelectorProps): JSX.Element {
    const { data } = useContext(DataContext);
    const { filter } = useContext(FilterContext);
    const { t } = useTranslation(["QueryPage"]);

    const filterAttribute: FilterType = mainFilterAttributes[props.index];
    const filterValues: string[] = filter[filterAttribute];
    const allFilterValues: string[] = data.uniqueValues[filterAttribute];
    const noFilter: boolean = CheckIfSingleFilterIsSet(filter, filterAttribute);
    return (
        <Selector
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
