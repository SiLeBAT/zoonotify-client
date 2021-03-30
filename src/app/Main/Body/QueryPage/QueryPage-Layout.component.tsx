/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useState } from "react";
import { DrawerLayoutComponent } from "./Drawer/Drawer-Layout.component";
import { QueryPageDrawerControlComponent } from "./Drawer/ControlBar/QueryPage-DrawerControl.component";
import { QueryPageContentLayoutComponent } from "./QueryPageContent-Layout.component";
import { FilterInterface, FilterType } from "../../../Shared/Model/Filter.model";
import { TableInterface, TableType } from "../../../Shared/Context/TableContext";

const mainStyle = css`
    height: 100%;
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
`;

export function QueryPageLayoutComponent(props: {
    isCol: boolean;
    isRow: boolean;
    isFilter: boolean;
    columnNameValues: string[];
    numberOfIsolates: {
        total: number,
        filtered: number
    }
    dataUniqueValues: FilterInterface;
    selectedFilter: FilterInterface;
    tableContext: TableInterface;
    mainFilterAttributes: string[];
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
    onRadioChange: (eventTargetValue: string) => void;
}): JSX.Element {
    const [drawerWidth, setDrawerWidth] = useState(433);
    const [open, setOpen] = useState(true);

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

    const handleRadioChange = (eventTargetValue: string): void =>
        props.onRadioChange(eventTargetValue);

    const handleClickOpenCloseDrawer = (): void => {
        if (open) {
            setOpen(false);
        } else {
            setOpen(true);
        }
    };

    const handleChangeDrawerSize = (newWidth: number): void => {
        setDrawerWidth(newWidth);
    };

    return (
        <main css={mainStyle}>
            <DrawerLayoutComponent
                isOpen={open}
                newWidth={drawerWidth}
                dataUniqueValues={props.dataUniqueValues}
                selectedFilter={props.selectedFilter}
                tableColumn={props.tableContext.column}
                tableRow={props.tableContext.row}
                mainFilterAttributes={props.mainFilterAttributes}
                onDisplFeaturesChange={handleChangeDisplFeatures}
                onDisplFeaturesSwap={handleSwapDisplFeatures}
                onDisplFeaturesRemoveAll={handleRemoveAllDisplFeatures}
                onFilterChange={handleChangeFilter}
                onFilterRemoveAll={handleRemoveAllFilter}
            />
            <QueryPageDrawerControlComponent
                isOpen={open}
                newWidth={drawerWidth}
                onDrawerOpenCloseClick={handleClickOpenCloseDrawer}
                onDrawerSizeChange={handleChangeDrawerSize}
            />
            <QueryPageContentLayoutComponent
                isCol={props.isCol}
                isRow={props.isRow}
                isFilter={props.isFilter}
                columnNameValues={props.columnNameValues}
                tableContext={props.tableContext}
                numberOfIsolates={{
                    total: props.numberOfIsolates.total,
                    filtered: props.numberOfIsolates.filtered
                }}
                selectedFilter={props.selectedFilter}
                mainFilterAttributes={props.mainFilterAttributes}
                onRadioChange={handleRadioChange}
            />
        </main>
    );
}
