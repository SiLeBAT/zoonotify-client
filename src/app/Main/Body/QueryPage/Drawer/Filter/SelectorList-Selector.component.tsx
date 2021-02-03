import React, { useContext } from "react";
import { ValueType } from "react-select";
import { useTranslation } from "react-i18next";
import { CheckIfSingleFilterIsSet } from "../../../../../Core/FilterServices/checkIfFilterIsSet.service";
import { DataContext } from "../../../../../Shared/Context/DataContext";
import { FilterContext } from "../../../../../Shared/Context/FilterContext";
import { FilterType } from "../../../../../Shared/Model/Filter.model";
import { TableType } from "../../../../../Shared/Context/TableContext";
import { SelectorComponent } from "../../../../../Shared/Selector.component";

function generateSelectorObject(
    selectorArray: string[]
): { value: string; label: string }[] {
    const selectorLabelObject: {
        value: string;
        label: string;
    }[] = selectorArray.map((filterValue) => {
        return { value: filterValue, label: filterValue };
    });

    return selectorLabelObject;
}

export interface SelectorProps {
    index: number;
    handleChange: (
        selectedOption: ValueType<Record<string, string>>,
        keyName: FilterType | TableType
    ) => void;
}

/**
 * @desc Generate a new selector-element for one main filter
 * @param   {number}            index         number of the element
 * @param   {FilterInterface}   filter        object with selected filters
 * @param   {FilterInterface}   uniqueValues  all possible filter values;
 * @param   {( selectedOption: ValueType<Record<string, string>>b, keyName: FilterType | TableType) => void} handleChange function to handle selector change
 * @return  {JSX.Element}                     new selector-element
 */
export function SelectorListSelectorComponent(
    props: SelectorProps
): JSX.Element {
    const { data } = useContext(DataContext);
    const { filter } = useContext(FilterContext);
    const { t } = useTranslation(["QueryPage"]);

    const filterAttribute: FilterType = filter.mainFilter[props.index];
    const filterValues: string[] = filter.selectedFilter[filterAttribute];
    const allFilterValues: string[] = data.uniqueValues[filterAttribute];

    const noFilter: boolean = CheckIfSingleFilterIsSet(
        filter.selectedFilter,
        filterAttribute
    );

    const dropDownValuesObj: {
        value: string;
        label: string;
    }[] = generateSelectorObject(allFilterValues);
    const selectedValuesObj: {
        value: string;
        label: string;
    }[] = generateSelectorObject(filterValues);

    return (
        <SelectorComponent
            key={`filter-selector-${filterAttribute}`}
            label={t(`Filters.${filterAttribute}`)}
            noOptionLabel={t("Drawer.Selector")}
            dropDownValuesObj={dropDownValuesObj}
            selectedValuesObj={selectedValuesObj}
            selectAttribute={filterAttribute}
            handleChange={props.handleChange}
            isMulti
            isNotSelect={noFilter}
        />
    );
}
