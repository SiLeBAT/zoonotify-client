import { ValueType } from "react-select";
import { SelectorListSelectorComponent } from "./SelectorList-Selector.component";
import { TableType } from "../../../../../Shared/Context/TableContext";
import { FilterType } from "../../../../../Shared/Model/Filter.model";

/**
 * @desc Generate a selector-element for each main filter
 * @param mainFilterAttributes - all possible main filter
 * @param onChange - function to handle the chance of a filter selectors
 * @return {JSX.Element[]} selector-elements in a list
 */
export function FilterSelectorListComponent(
    mainFilterAttributes: string[],
    onChange: (
        selectedOption: ValueType<{ value: string; label: string }>,
        keyName: FilterType | TableType
    ) => void
): JSX.Element[] {
    const handleChange = (
        selectedOption: ValueType<{ value: string; label: string }>,
        keyName: FilterType | TableType
    ): void => onChange(selectedOption, keyName);

    const totalNumberOfFilters: number = mainFilterAttributes.length;
    const elements: JSX.Element[] = [];
    for (let i = 0; i < totalNumberOfFilters; i += 1) {
        elements.push(
            SelectorListSelectorComponent({
                index: i,
                onChange: handleChange,
            })
        );
    }
    return elements;
}
