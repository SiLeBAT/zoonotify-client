import { SelectorListSelectorComponent } from "./SelectorList-Selector.component";
import { TableType } from "../../../../../Shared/Context/TableContext";
import {
    FilterInterface,
    FilterType,
} from "../../../../../Shared/Model/Filter.model";

/**
 * @desc Generate a selector-element for each main filter
 * @param mainFilterAttributes - all possible main filter
 * @param onChange - function to handle the chance of a filter selectors
 * @return {JSX.Element[]} selector-elements in a list
 */
export function FilterSelectorListComponent(
    dataUniqueValues: FilterInterface,
    selectedFilter: FilterInterface,
    mainFilterAttributes: string[],
    onChange: (
        selectedOption: { value: string; label: string }[] | null,
        keyName: FilterType | TableType
    ) => void
): JSX.Element[] {
    const handleChange = (
        selectedOption: { value: string; label: string }[] | null,
        keyName: FilterType | TableType
    ): void => onChange(selectedOption, keyName);

    const elements: JSX.Element[] = [];
    mainFilterAttributes.forEach((mainFilter) => {
        elements.push(
            SelectorListSelectorComponent({
                dataUniqueValues,
                selectedFilter,
                filterAttribute: mainFilter,
                onChange: handleChange,
            })
        );
    });
    /*     for (let i = 0; i < totalNumberOfFilters; i += 1) {
        
        );
    } */
    return elements;
}
