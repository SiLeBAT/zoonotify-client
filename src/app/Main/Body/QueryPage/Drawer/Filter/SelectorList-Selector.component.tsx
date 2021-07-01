import React from "react";
import { ValueType } from "react-select";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { CheckIfSingleFilterIsSet } from "../../Services/checkIfFilterIsSet.service";
import {
    FilterInterface,
    FilterType,
} from "../../../../../Shared/Model/Filter.model";
import { TableType } from "../../../../../Shared/Context/TableContext";
import { SelectorComponent } from "../../../../../Shared/Selector.component";

function generateSelectorObject(
    filterAttribute: string,
    selectorArray: string[],
    t: TFunction
): { value: string; label: string }[] {
    return selectorArray.map((filterValue) => {
        const filterValueLabel = t(`FilterValues.${filterAttribute}.${filterValue.replace(".", "")}`)
        return { value: filterValue, label: filterValueLabel };
    });
}

export interface SelectorProps {
    hide: boolean;
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
 * @param props
 * @return {JSX.Element} new selector-element
 */
export function SelectorListSelectorComponent(
    props: SelectorProps
): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    const { filterAttribute } = props;
    const filterValues: string[] = props.selectedFilter[filterAttribute];
    const allFilterValues: string[] = props.dataUniqueValues[filterAttribute];

    const handleChange = (
        selectedOption: ValueType<{ value: string; label: string }>,
        keyName: FilterType | TableType
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
    }[] = generateSelectorObject(filterAttribute, allFilterValues, t);
    const selectedValuesObj: {
        value: string;
        label: string;
    }[] = generateSelectorObject(filterAttribute, filterValues, t);

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
            isDisabled={false}
            hide={props.hide}
        />
    );
}
