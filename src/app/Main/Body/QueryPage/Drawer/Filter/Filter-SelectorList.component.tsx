import { useTranslation } from "react-i18next";
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
    mainFilter: string[],
    subFilters: ClientSingleFilterConfig[],
    onChange: (
        selectedOption: { value: string; label: string }[] | null,
        keyName: FilterType | FeatureType
    ) => void
): JSX.Element[] {
    const { t } = useTranslation(["QueryPage"]);

    const handleChange = (
        selectedOption: { value: string; label: string }[] | null,
        keyName: FilterType | FeatureType
    ): void => onChange(selectedOption, keyName);

    const noOptionLabel = t("Drawer.Selector");

    const filterSelectorsList: JSX.Element[] = [];
    mainFilter.forEach((filter) => {
        if (_.includes(filtersToDisplay, filter)) {
            filterSelectorsList.push(
                SelectorListSelectorComponent({
                    dataIsLoading,
                    hide: false,
                    dataUniqueValues,
                    selectedFilter,
                    filterAttribute: filter,
                    onChange: handleChange,
                })
            );
            subFilters.forEach((subFilter) => {
                if (filter === subFilter.parent) {
                    const subFilterTarget = subFilter.target;
                    if (
                        subFilterTarget !== undefined &&
                        _.includes(
                            selectedFilter.microorganism,
                            subFilterTarget
                        )
                    ) {
                        const subFilterAttribute = subFilter.id;
                        const subFilterValues = subFilter.values;
                        filterSelectorsList.push(
                            SubFilterSelectorComponent({
                                dataIsLoading,
                                subFilterTarget,
                                subFilterAttribute,
                                subFilterValues,
                                selectedFilter,
                                onChange: handleChange,
                                noOptionLabel,
                            })
                        );
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
                    onChange: handleChange,
                })
            );
        }
    });
    return filterSelectorsList;
}
