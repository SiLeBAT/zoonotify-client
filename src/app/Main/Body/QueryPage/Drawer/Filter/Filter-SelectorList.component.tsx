import _ from "lodash";
import { SelectorListSelectorComponent } from "./SelectorList-Selector.component";
import { FeatureType } from "../../../../../Shared/Context/DataContext";
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
    filtersToDisplay: string[],
    mainFilter: string[],
    onChange: (
        selectedOption: { value: string; label: string }[] | null,
        keyName: FilterType | FeatureType
    ) => void
): JSX.Element[] {
    const handleChange = (
        selectedOption: { value: string; label: string }[] | null,
        keyName: FilterType | FeatureType
    ): void => onChange(selectedOption, keyName);

    const elements: JSX.Element[] = [];
    mainFilter.forEach((filter) => {
        if ( _.includes(filtersToDisplay, filter)) {
            elements.push(
                SelectorListSelectorComponent({
                    hide: false,
                    dataUniqueValues,
                    selectedFilter,
                    filterAttribute: filter,
                    onChange: handleChange,
                })
            );
        } else {
            elements.push(
                SelectorListSelectorComponent({
                    hide: true,
                    dataUniqueValues,
                    selectedFilter,
                    filterAttribute: filter,
                    onChange: handleChange,
                })
            );
        }

    });
    return elements;
}
