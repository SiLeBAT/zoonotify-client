import React from "react";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import { DrawerFilterComponent } from "./Filter/Drawer-Filter.component";
import { DrawerDisplayedFeaturesComponent } from "./Displayed_Features/Drawer-DisplFeatures.component";
import {
    ClientSingleFilterConfig,
    FilterInterface,
    FilterType,
} from "../../../../Shared/Model/Filter.model";
import { FeatureType } from "../../../../Shared/Context/DataContext";
import { FilterContextInterface } from "../../../../Shared/Context/FilterContext";

const useStyles = makeStyles(() =>
    createStyles({
        drawer: (drawerWidth: string) => ({
            width: `${drawerWidth}px`,
            minWidth: "325px",
            position: "relative",
            height: "100%",
            zIndex: 0,
        }),
        drawerPaper: {
            width: "inherit",
            zIndex: 0,
            position: "relative",
            direction: "rtl",
            overflow: "auto",
        },
        drawerContainer: {
            direction: "ltr",
            padding: "1em",
            height: "100%",
        },
    })
);

export interface DrawerLayoutProps {
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
export function DrawerLayoutComponent(props: DrawerLayoutProps): JSX.Element {
    const drawerWidthSting = (props.drawerWidth as unknown) as string;
    const classes = useStyles(drawerWidthSting);

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
        <Drawer
            className={classes.drawer}
            variant="persistent"
            anchor="left"
            open={props.isOpen}
            classes={{
                paper: classes.drawerPaper,
            }}
        >
            <div className={classes.drawerContainer}>
                <DrawerFilterComponent
                    dataUniqueValues={props.dataUniqueValues}
                    filterInfo={props.filterInfo}
                    subFilters={props.subFilters}
                    onFilterChange={handleChangeFilter}
                    onFilterRemoveAll={handleRemoveAllFilter}
                    onSubmitFiltersToDisplay={handleSubmitFiltersToDisplay}
                />
                <DrawerDisplayedFeaturesComponent
                    dataIsLoading={props.dataIsLoading}
                    columnFeature={props.columnFeature}
                    rowFeature={props.rowFeature}
                    mainFilterAttributes={props.filterInfo.mainFilter}
                    onDisplFeaturesChange={handleChangeDisplFeatures}
                    onDisplFeaturesSwap={handleSwapDisplFeatures}
                    onDisplFeaturesRemoveAll={handleRemoveAllDisplFeatures}
                />
            </div>
        </Drawer>
    );
}
