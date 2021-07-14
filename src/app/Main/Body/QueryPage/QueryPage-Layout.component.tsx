/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { MutableRefObject, useState } from "react";
import { DrawerLayoutComponent } from "./Drawer/Drawer-Layout.component";
import { QueryPageDrawerControlComponent } from "./Drawer/ControlBar/QueryPage-DrawerControl.component";
import { QueryPageContentLayoutComponent } from "./QueryPageContent-Layout.component";
import {
    FilterInterface,
    FilterType,
} from "../../../Shared/Model/Filter.model";
import {
    TableInterface,
    TableType,
} from "../../../Shared/Context/TableContext";
import { FilterContextInterface } from "../../../Shared/Context/FilterContext";
import { DisplayRowCol } from "./Results/TableResults/TableResults.model";

const mainStyle = css`
    height: 100%;
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
`;

export function QueryPageLayoutComponent(props: {
    displayRowCol: DisplayRowCol;
    isFilter: boolean;
    tableIsLoading: boolean;
    columnNameValues: string[];
    numberOfIsolates: {
        total: number;
        filtered: number;
    };
    dataUniqueValues: FilterInterface;
    filterInfo: FilterContextInterface;
    tableData: TableInterface;
    getPngDownloadUriRef: MutableRefObject<(() => Promise<string>) | null>;
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
    onDisplayOptionsChange: (displayOption: string) => void;
    onSubmitFiltersToDisplay: (newFiltersToDisplay: string[]) => void;
    onDownloadChart: () => void;
}): JSX.Element {
    const [drawerWidth, setDrawerWidth] = useState<number>(433);
    const [isOpen, setIsOpen] = useState<boolean>(true);

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

    const handleChangeDisplayOptions = (displayOption: string): void =>
        props.onDisplayOptionsChange(displayOption);

    const handleClickOpenCloseDrawer = (): void => {
        if (isOpen) {
            setIsOpen(false);
        } else {
            setIsOpen(true);
        }
    };

    const handleMoveResizeBar = (newWidth: number): void => {
        setDrawerWidth(newWidth);
    };

    const handleSubmitFiltersToDisplay = (
        newFiltersToDisplay: string[]
    ): void => {
        props.onSubmitFiltersToDisplay(newFiltersToDisplay);
    };

    const handleChartDownload = (): void => props.onDownloadChart();

    return (
        <main css={mainStyle}>
            <DrawerLayoutComponent
                isOpen={isOpen}
                tableIsLoading={props.tableIsLoading}
                drawerWidth={drawerWidth}
                dataUniqueValues={props.dataUniqueValues}
                filterInfo={props.filterInfo}
                tableColumn={props.tableData.column}
                tableRow={props.tableData.row}
                onDisplFeaturesChange={handleChangeDisplFeatures}
                onDisplFeaturesSwap={handleSwapDisplFeatures}
                onDisplFeaturesRemoveAll={handleRemoveAllDisplFeatures}
                onFilterChange={handleChangeFilter}
                onFilterRemoveAll={handleRemoveAllFilter}
                onSubmitFiltersToDisplay={handleSubmitFiltersToDisplay}
            />
            <QueryPageDrawerControlComponent
                isOpen={isOpen}
                drawerWidth={drawerWidth}
                onDrawerOpenCloseClick={handleClickOpenCloseDrawer}
                onResizeBarMove={handleMoveResizeBar}
            />
            <QueryPageContentLayoutComponent
                displayRowCol={props.displayRowCol}
                isFilter={props.isFilter}
                tableIsLoading={props.tableIsLoading}
                columnNameValues={props.columnNameValues}
                tableData={props.tableData}
                numberOfIsolates={props.numberOfIsolates}
                selectedFilter={props.filterInfo.selectedFilter}
                getPngDownloadUriRef={props.getPngDownloadUriRef}
                onDisplayOptionsChange={handleChangeDisplayOptions}
                onDownloadChart={handleChartDownload}
            />
        </main>
    );
}
