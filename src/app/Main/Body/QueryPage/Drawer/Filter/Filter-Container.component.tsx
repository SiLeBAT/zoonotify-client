import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FilterSelectorListComponent } from "./Filter-SelectorList.component";
import { ClearSelectorComponent } from "../../../../../Shared/ClearSelectorButton.component";
import {
    ClientSingleFilterConfig,
    FilterInterface,
    FilterType,
} from "../../../../../Shared/Model/Filter.model";
import { FeatureType } from "../../../../../Shared/Context/DataContext";
import { FilterContextInterface } from "../../../../../Shared/Context/FilterContext";
import { FilterLayoutComponent } from "./Filter-Layout.component";
import { FilterDialogButtonComponent } from "./FilterDialogButton.component";
import { FilterDialogComponent } from "./FilterDialog/FilterDialog.component";

export function FilterContainer(props: {
    dataIsLoading: boolean;
    dataUniqueValues: FilterInterface;
    filterInfo: FilterContextInterface;
    subFilters: ClientSingleFilterConfig[];
    onFilterChange: (
        selectedOption: { value: string; label: string }[] | null,
        keyName: FilterType | FeatureType
    ) => void;
    onFilterRemoveAll: () => void;
    onSubmitFiltersToDisplay: (newFiltersToDisplay: string[]) => void;
}): JSX.Element {
    const [filterDialogIsOpen, setFilterDialogIsOpen] =
        useState<boolean>(false);
    const { t } = useTranslation(["QueryPage"]);

    const handleChangeFilter = (
        selectedOption: { value: string; label: string }[] | null,
        keyName: FilterType | FeatureType
    ): void => props.onFilterChange(selectedOption, keyName);
    const handleRemoveAllFilter = (): void => props.onFilterRemoveAll();

    const handleClickOpenFilterSettingDialog = (): void => {
        setFilterDialogIsOpen(true);
    };

    const handleCancelFiltersToDisplay = (): void => {
        setFilterDialogIsOpen(false);
    };

    const handleSubmitFiltersToDisplay = (
        newFiltersToDisplay: string[]
    ): void => {
        props.onSubmitFiltersToDisplay(newFiltersToDisplay);
        setFilterDialogIsOpen(false);
    };

    const filterDialogButtonText = t("FilterDialog.ButtonText");

    return (
        <div>
            <FilterLayoutComponent
                title={t("Drawer.Subtitles.Filter")}
                clearSelector={
                    <ClearSelectorComponent
                        onClick={handleRemoveAllFilter}
                        disabled={props.dataIsLoading}
                    />
                }
                filterSelectorList={FilterSelectorListComponent(
                    props.dataIsLoading,
                    props.dataUniqueValues,
                    props.filterInfo.selectedFilter,
                    props.filterInfo.displayedFilters,
                    props.filterInfo.mainFilter,
                    props.subFilters,
                    handleChangeFilter
                )}
                filterDialogButton={
                    <FilterDialogButtonComponent
                        buttonText={filterDialogButtonText}
                        onOpenFilterDialogClick={
                            handleClickOpenFilterSettingDialog
                        }
                    />
                }
            />
            {filterDialogIsOpen && (
                <FilterDialogComponent
                    previousFiltersToDisplay={props.filterInfo.displayedFilters}
                    availableFilters={props.filterInfo.mainFilter}
                    onSubmitFiltersToDisplay={handleSubmitFiltersToDisplay}
                    onCancelFiltersToDisplay={handleCancelFiltersToDisplay}
                />
            )}
        </div>
    );
}
