import React from "react";
import { ValueType } from "react-select";
import { useTranslation } from "react-i18next";
import { CheckIfSingleFilterIsSet } from "../../QueryPageServices/checkIfFilterIsSet.service";
import { FilterInterface, FilterType } from "../../../../../Shared/Model/Filter.model";
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
    dataUniqueValues: FilterInterface;
    selectedFilter: FilterInterface;
    filterAttribute: FilterType;
    onChange: (
        selectedOption: { value: string; label: string }[] | null,
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
    const { t } = useTranslation(["QueryPage"]);

    const {filterAttribute} = props
    const filterValues: string[] = props.selectedFilter[filterAttribute];
    const allFilterValues: string[] = props.dataUniqueValues[filterAttribute];

    const handleChange = (
        selectedOption: ValueType<{ value: string; label: string }>,
        keyName: FilterType | TableType
    ): void =>
        props.onChange(
            selectedOption as { value: string; label: string }[] | null,
            keyName
        );

    const noFilter: boolean = CheckIfSingleFilterIsSet(
        props.selectedFilter,
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
