/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useState } from "react";
import { DrawerLayoutComponent } from "./Drawer/Drawer-Layout.component";
import { QueryPageDrawerControlComponent } from "./Drawer/ControlBar/QueryPage-DrawerControl.component";
import { QueryPageContentLayoutComponent } from "./QueryPageContent-Layout.component";
import { FilterInterface, FilterType } from "../../../Shared/Model/Filter.model";
import { DisplayOptionType, TableType } from "../../../Shared/Context/TableContext";

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
    colAttributes: string[];
    totalNrOfIsol: number;
    nrOfSelectedIsol: number;
    dataUniqueValues: FilterInterface;
    selectedFilter: FilterInterface;
    tableColumn: string;
    tableRow: string;
    tableOption: DisplayOptionType,
    tables: {
        statisticDataAbsolute: Record<string, string>[];
        statisticDataPercent: Record<string, string>[];
    };
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
                tableColumn={props.tableColumn}
                tableRow={props.tableRow}
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
                colAttributes={props.colAttributes}
                tableColumn={props.tableColumn}
                tableRow={props.tableRow}
                tableOption={props.tableOption}
                tables={{
                    statisticDataAbsolute: props.tables.statisticDataAbsolute,
                    statisticDataPercent: props.tables.statisticDataPercent
                }}
                totalNrOfIsol={props.totalNrOfIsol}
                nrOfSelectedIsol={props.nrOfSelectedIsol}
                selectedFilter={props.selectedFilter}
                mainFilterAttributes={props.mainFilterAttributes}
                onRadioChange={handleRadioChange}
            />
        </main>
    );
}
