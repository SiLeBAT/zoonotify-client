import { TFunction } from "i18next";
import _ from "lodash";
import { SelectorListSelectorComponent } from "./SelectorList-Selector.component";
import { FeatureType } from "../../../../../Shared/Context/DataContext";
import {
    ClientSingleFilterConfig,
    FilterInterface,
    FilterType,
} from "../../../../../Shared/Model/Filter.model";
import { SubFilterSelectorComponent } from "./SubFilter-Selector.component";

/**
 * @desc Generate a selector-element for each main filter and subfilter
 * @param mainFilterAttributes - all possible main filter
 * @param onChange - function to handle the chance of a filter selectors
 * @return {JSX.Element[]} selector-elements in a list
 */
export function FilterSelectorListComponent(
    dataIsLoading: boolean,
    dataUniqueValues: FilterInterface,
    selectedFilter: FilterInterface,
    filtersToDisplay: string[],
    subFilters: ClientSingleFilterConfig[],
    noOptionLabel: string,
    t: TFunction,
    onChange: (
        selectedOption: { value: string; label: string }[] | null,
        keyName: FilterType | FeatureType
    ) => void
): JSX.Element[] {
    const handleChange = (
        selectedOption: { value: string; label: string }[] | null,
        keyName: FilterType | FeatureType
    ): void => onChange(selectedOption, keyName);

    const filterSelectorsList: JSX.Element[] = [];

    filtersToDisplay.forEach((filter) => {
        const attributeLabel = t(`Filters.${filter}`);
        if (_.includes(filtersToDisplay, filter)) {
            filterSelectorsList.push(
                SelectorListSelectorComponent({
                    dataIsLoading,
                    hide: false,
                    dataUniqueValues,
                    selectedFilter,
                    filterAttribute: filter,
                    selectorLabel: attributeLabel,
                    noOptionLabel,
                    t,
                    onChange: handleChange,
                })
            );
            subFilters.forEach((subFilter) => {
                if (
                    Object.keys(selectedFilter.subfilters).includes(
                        subFilter.id
                    )
                ) {
                    if (filter === subFilter.parent) {
                        const subFilterTrigger = subFilter.trigger;
                        const subFilterParent = subFilter.parent;
                        if (
                            subFilterTrigger !== undefined &&
                            (_.includes(
                                selectedFilter.filters.microorganism,
                                subFilterTrigger
                            ) ||
                                _.includes(
                                    selectedFilter.filters.matrix,
                                    subFilterTrigger
                                ))
                        ) {
                            const subFilterAttribute = subFilter.id;
                            const subFilterValues = subFilter.values;
                            filterSelectorsList.push(
                                SubFilterSelectorComponent({
                                    dataIsLoading,
                                    subFilterParent,
                                    subFilterTrigger,
                                    subFilterAttribute,
                                    subFilterValues,
                                    selectedFilter,
                                    onChange: handleChange,
                                    noOptionLabel,
                                    t,
                                })
                            );
                        }
                    }
                }
            });
        } else {
            filterSelectorsList.push(
                SelectorListSelectorComponent({
                    dataIsLoading,
                    hide: true,
                    dataUniqueValues,
                    selectedFilter,
                    filterAttribute: filter,
                    selectorLabel: attributeLabel,
                    noOptionLabel,
                    t,
                    onChange: handleChange,
                })
            );
        }
    });
    return filterSelectorsList;
}
