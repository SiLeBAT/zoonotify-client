import React from "react";
import { useTranslation } from "react-i18next";
import { DrawerDisplayedFeaturesComponent } from "./Displayed_Features/Drawer-DisplFeatures.component";
import {
    ClientSingleFilterConfig,
    FilterInterface,
    FilterType,
} from "../../../../Shared/Model/Filter.model";
import { FeatureType } from "../../../../Shared/Context/DataContext";
import { FilterContextInterface } from "../../../../Shared/Context/FilterContext";
import { DrawerLayoutComponent } from "./Drawer-Layout.component";
import { FilterContainer } from "./Filter/Filter-Container.component";

export interface DrawerProps {
    /**
     * true if Drawer is open
     */
    isOpen: boolean;
    dataIsLoading: boolean;
    drawerWidth: number;
    dataUniqueValues: FilterInterface;
    filterInfo: FilterContextInterface;
    subFilters: ClientSingleFilterConfig[];
    columnFeature: string;
    rowFeature: string;
    onDisplFeaturesChange: (
        selectedOption: { value: string; label: string } | null,
        keyName: FilterType | FeatureType
    ) => void;
    onDisplFeaturesSwap: () => void;
    onDisplFeaturesRemoveAll: () => void;
    onFilterChange: (
        selectedOption: { value: string; label: string }[] | null,
        keyName: FilterType | FeatureType
    ) => void;
    onFilterRemoveAll: () => void;
    onSubmitFiltersToDisplay: (newFiltersToDisplay: string[]) => void;
}

/**
 * @desc Returns the Drawer
 * @param props
 * @returns {JSX.Element} - Drawer component
 */
export function DrawerContainer(props: DrawerProps): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    const drawerTitle = t("Drawer.Title");
    const handleChangeDisplFeatures = (
        selectedOption: { value: string; label: string } | null,
        keyName: FilterType | FeatureType
    ): void => props.onDisplFeaturesChange(selectedOption, keyName);
    const handleSwapDisplFeatures = (): void => props.onDisplFeaturesSwap();
    const handleRemoveAllDisplFeatures = (): void =>
        props.onDisplFeaturesRemoveAll();

    const handleChangeFilter = (
        selectedOption: { value: string; label: string }[] | null,
        keyName: FilterType | FeatureType
    ): void => props.onFilterChange(selectedOption, keyName);
    const handleRemoveAllFilter = (): void => props.onFilterRemoveAll();

    const handleSubmitFiltersToDisplay = (
        newFiltersToDisplay: string[]
    ): void => {
        props.onSubmitFiltersToDisplay(newFiltersToDisplay);
    };

    return (
        <DrawerLayoutComponent
            filterSelection={
                <FilterContainer
                    dataIsLoading={props.dataIsLoading}
                    dataUniqueValues={props.dataUniqueValues}
                    filterInfo={props.filterInfo}
                    subFilters={props.subFilters}
                    onFilterChange={handleChangeFilter}
                    onFilterRemoveAll={handleRemoveAllFilter}
                    onSubmitFiltersToDisplay={handleSubmitFiltersToDisplay}
                />
            }
            displayFeatureSelection={
                <DrawerDisplayedFeaturesComponent
                    dataIsLoading={props.dataIsLoading}
                    columnFeature={props.columnFeature}
                    rowFeature={props.rowFeature}
                    mainFilterAttributes={props.filterInfo.mainFilters}
                    onDisplFeaturesChange={handleChangeDisplFeatures}
                    onDisplFeaturesSwap={handleSwapDisplFeatures}
                    onDisplFeaturesRemoveAll={handleRemoveAllDisplFeatures}
                />
            }
            isOpen={props.isOpen}
            drawerWidth={props.drawerWidth}
            drawerTitle={drawerTitle}
        />
    );
}
