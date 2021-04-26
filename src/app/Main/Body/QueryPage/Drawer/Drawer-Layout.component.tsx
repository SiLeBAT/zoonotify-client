import React, { useState } from "react";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import { DrawerFilterComponent } from "./Filter/Drawer-Filter.component";
import { DrawerDisplayedFeaturesComponent } from "./Displayed_Features/Drawer-DisplFeatures.component";
import {
    FilterInterface,
    FilterType,
} from "../../../../Shared/Model/Filter.model";
import { TableType } from "../../../../Shared/Context/TableContext";
import { FilterSettingDialogComponent } from "./Filter/FilterSetting-Dialog.component";
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
        },
        drawerContainer: {
            overflow: "auto",
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
    drawerWidth: number;
    dataUniqueValues: FilterInterface;
    filterInfo: FilterContextInterface;
    tableColumn: string;
    tableRow: string;
    onDisplFeaturesChange: (
        selectedOption: { value: string; label: string } | null,
        keyName: FilterType | TableType
    ) => void;
    onDisplFeaturesSwap: () => void;
    onDisplFeaturesRemoveAll: () => void;
    onFilterChange: (
        selectedOption: { value: string; label: string }[] | null,
        keyName: FilterType | TableType
    ) => void;
    onFilterRemoveAll: () => void;
    onSubmitClick: (filterToDisplay: string[]) => void;
}

/**
 * @desc Returns the Drawer
 * @param props
 * @returns {JSX.Element} - Drawer component
 */
export function DrawerLayoutComponent(props: DrawerLayoutProps): JSX.Element {
    const [filterDialogIsOpen, setFilterDialogIsOpen] = useState<boolean>(false);

    const drawerWidthSting = (props.drawerWidth as unknown) as string;
    const classes = useStyles(drawerWidthSting);

    const handleChangeDisplFeatures = (
        selectedOption: { value: string; label: string } | null,
        keyName: FilterType | TableType
    ): void => props.onDisplFeaturesChange(selectedOption, keyName);
    const handleSwapDisplFeatures = (): void => props.onDisplFeaturesSwap();
    const handleRemoveAllDisplFeatures = (): void =>
        props.onDisplFeaturesRemoveAll();

    const handleChangeFilter = (
        selectedOption: { value: string; label: string }[] | null,
        keyName: FilterType | TableType
    ): void => props.onFilterChange(selectedOption, keyName);
    const handleRemoveAllFilter = (): void => props.onFilterRemoveAll();

    const handleClickOpenFilterSettingDialog = (): void => {
        setFilterDialogIsOpen(true);
    };
    const handleClickCloseFilterSettingDialog = (): void => {
        setFilterDialogIsOpen(false);
    };


    const handleClickSubmit = (filterToDisplay: string[]): void =>
        props.onSubmitClick(filterToDisplay);

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
                    selectedFilter={props.filterInfo.selectedFilter}
                    filterToDisplay={props.filterInfo.displayedFilter}
                    mainFilterAttributes={props.filterInfo.mainFilter}
                    onFilterChange={handleChangeFilter}
                    onFilterRemoveAll={handleRemoveAllFilter}
                />
                <FilterSettingDialogComponent
                    isOpen={filterDialogIsOpen}
                    onClickOpen={handleClickOpenFilterSettingDialog}
                    onClickClose={handleClickCloseFilterSettingDialog}
                    onSubmitClick={handleClickSubmit}
                    mainFilters={props.filterInfo.mainFilter}
                    displayedFilter={props.filterInfo.displayedFilter}
                />
                <DrawerDisplayedFeaturesComponent
                    tableColumn={props.tableColumn}
                    tableRow={props.tableRow}
                    mainFilterAttributes={props.filterInfo.mainFilter}
                    onDisplFeaturesChange={handleChangeDisplFeatures}
                    onDisplFeaturesSwap={handleSwapDisplFeatures}
                    onDisplFeaturesRemoveAll={handleRemoveAllDisplFeatures}
                />
            </div>
        </Drawer>
    );
}
