/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { MutableRefObject, useState } from "react";
import { DrawerLayoutComponent } from "./Drawer/Drawer-Layout.component";
import { QueryPageDrawerControlComponent } from "./Drawer/ControlBar/QueryPage-DrawerControl.component";
import { QueryPageContentLayoutComponent } from "./QueryPageContent-Layout.component";
import {
    ClientSingleFilterConfig,
    FilterInterface,
    FilterType,
} from "../../../Shared/Model/Filter.model";
import {
    DataInterface,
    FeatureType,
} from "../../../Shared/Context/DataContext";
import { FilterContextInterface } from "../../../Shared/Context/FilterContext";
import { SubHeaderLayoutComponent } from "./Subheader/SubHeader-Layout.component";

const mainStyle = css`
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
`;

const queryPageStyle = css`
    display: flex;
    flex: 1 1 0;
    overflow: auto;
    flex-direction: row;
    box-sizing: border-box;
`;

export function QueryPageLayoutComponent(props: {
    isFilter: boolean;
    dataIsLoading: boolean;
    columnNameValues: string[];
    numberOfIsolates: {
        total: number;
        filtered: number;
    };
    dataUniqueValues: FilterInterface;
    filterInfo: FilterContextInterface;
    subFilters: ClientSingleFilterConfig[];
    data: DataInterface;
    getPngDownloadUriRef: MutableRefObject<(() => Promise<string>) | null>;
    tableExportProps: {
        onExportTableChange: (name: string, checked: boolean) => void;
        onExportDialogOpenClick: () => void;
        onExportDialogClose: () => void;
        onExportTablesClick: () => void;
        exportRowOrStatTable: {
            raw: boolean;
            stat: boolean;
            chart: boolean;
        };
        isOpen: boolean;
        isLoading: boolean;
    };
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
    onDisplayOptionsChange: (displayOption: string) => void;
    onSubmitFiltersToDisplay: (newFiltersToDisplay: string[]) => void;
}): JSX.Element {
    const [drawerWidth, setDrawerWidth] = useState<number>(433);
    const [isOpen, setIsOpen] = useState<boolean>(true);

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

    return (
        <main css={mainStyle}>
            <SubHeaderLayoutComponent
                exportRowOrStatTable={
                    props.tableExportProps.exportRowOrStatTable
                }
                isOpen={props.tableExportProps.isOpen}
                isLoading={props.tableExportProps.isLoading}
                nrOfIsolates={props.numberOfIsolates.filtered}
                onExportTableChange={props.tableExportProps.onExportTableChange}
                onClickOpen={props.tableExportProps.onExportDialogOpenClick}
                onHandleClose={props.tableExportProps.onExportDialogClose}
                onExportClick={props.tableExportProps.onExportTablesClick}
            />
            <div css={queryPageStyle}>
                <DrawerLayoutComponent
                    isOpen={isOpen}
                    dataIsLoading={props.dataIsLoading}
                    drawerWidth={drawerWidth}
                    dataUniqueValues={props.dataUniqueValues}
                    filterInfo={props.filterInfo}
                    subFilters={props.subFilters}
                    columnFeature={props.data.column}
                    rowFeature={props.data.row}
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
                    isFilter={props.isFilter}
                    dataIsLoading={props.dataIsLoading}
                    columnNameValues={props.columnNameValues}
                    data={props.data}
                    numberOfIsolates={props.numberOfIsolates}
                    selectedFilter={props.filterInfo.selectedFilter}
                    getPngDownloadUriRef={props.getPngDownloadUriRef}
                    onDisplayOptionsChange={handleChangeDisplayOptions}
                />
            </div>
        </main>
    );
}
