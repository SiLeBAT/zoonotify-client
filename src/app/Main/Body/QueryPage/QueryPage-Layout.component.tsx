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
    tableData: TableInterface;
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
    const [drawerWidth, setDrawerWidth] = useState<number>(433);
    const [open, setOpen] = useState<boolean>(true);
    const [sumRowCol, setSumRowCol] = useState<boolean>(true);

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

    const handleChangeCheckbox = (checked: boolean): void => {
        setSumRowCol(checked)
    };

    const handleMoveResizeBar = (newWidth: number): void => {
        setDrawerWidth(newWidth);
    };

    return (
        <main css={mainStyle}>
            <DrawerLayoutComponent
                isOpen={open}
                drawerWidth={drawerWidth}
                dataUniqueValues={props.dataUniqueValues}
                selectedFilter={props.selectedFilter}
                tableColumn={props.tableData.column}
                tableRow={props.tableData.row}
                mainFilterAttributes={props.mainFilterAttributes}
                onDisplFeaturesChange={handleChangeDisplFeatures}
                onDisplFeaturesSwap={handleSwapDisplFeatures}
                onDisplFeaturesRemoveAll={handleRemoveAllDisplFeatures}
                onFilterChange={handleChangeFilter}
                onFilterRemoveAll={handleRemoveAllFilter}
            />
            <QueryPageDrawerControlComponent
                isOpen={open}
                drawerWidth={drawerWidth}
                onDrawerOpenCloseClick={handleClickOpenCloseDrawer}
                onResizeBarMove={handleMoveResizeBar}
            />
            <QueryPageContentLayoutComponent
                isCol={props.isCol}
                isRow={props.isRow}
                isFilter={props.isFilter}
                isSumRowCol={sumRowCol}
                columnNameValues={props.columnNameValues}
                tableData={props.tableData}
                numberOfIsolates={props.numberOfIsolates}
                selectedFilter={props.selectedFilter}
                mainFilterAttributes={props.mainFilterAttributes}
                onRadioChange={handleRadioChange}
                onCheckboxChange={handleChangeCheckbox}
            />
        </main>
    );
}
