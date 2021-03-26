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
    return selectorArray.map((filterValue) => {
        return { value: filterValue, label: filterValue };
    });
}

export interface SelectorProps {
    /**
     * number of the element
     */
    index: number;
    onChange: (
        selectedOption: { value: string; label: string }[],
        keyName: FilterType | TableType
    ) => void;
}

/**
 * @desc Generate a new selector-element for one main filter
 * @param {SelectorProps} props      
 * @return {JSX.Element} new selector-element
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

    const handleChange = (
        selectedOption: ValueType<{ value: string; label: string }>,
        keyName: FilterType | TableType
    ): void => props.onChange(selectedOption as { value: string; label: string }[], keyName);

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
            onChange={handleChange}
            isMulti
            isNotSelect={noFilter}
        />
    );
}
