/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useState } from "react";
import { DrawerLayoutComponent } from "./Drawer/Drawer-Layout.component";
import { QueryPageDrawerControlComponent } from "./Drawer/ControlBar/QueryPage-DrawerControl.component";
import { QueryPageContentComponent } from "./QueryPage-Content.component";
import { FilterType } from "../../../Shared/Model/Filter.model";
import { TableType } from "../../../Shared/Context/TableContext";

const mainStyle = css`
    height: 100%;
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
`;

export function QueryPageComponent(props: {
    isCol: boolean;
    isRow: boolean;
    isFilter: boolean;
    colAttributes: string[];
    nrOfSelectedIsol: number;
    onDisplFeaturesChange: (
        selectedOption: { value: string; label: string },
        keyName: FilterType | TableType
    ) => void;
    onDisplFeaturesSwap: () => void;
    onDisplFeaturesRemoveAll: () => void;
    onFilterChange: (
        selectedOption: { value: string; label: string }[],
        keyName: FilterType | TableType
    ) => void;
    onFilterRemoveAll: () => void;
    onRadioChange: (eventTargetValue: string) => void;
}): JSX.Element {
    const [drawerWidth, setDrawerWidth] = useState(433);
    const [open, setOpen] = useState(true);

    const handleChangeDisplFeatures = (
        selectedOption: { value: string; label: string },
        keyName: FilterType | TableType
    ): void => props.onDisplFeaturesChange(selectedOption, keyName);
    const handleSwapDisplFeatures = (): void => props.onDisplFeaturesSwap();
    const handleRemoveAllDisplFeatures = (): void =>
        props.onDisplFeaturesRemoveAll();

    const handleChangeFilter = (
        selectedOption: { value: string; label: string }[],
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
            <QueryPageContentComponent
                isCol={props.isCol}
                isRow={props.isRow}
                isFilter={props.isFilter}
                colAttributes={props.colAttributes}
                nrOfSelectedIsol={props.nrOfSelectedIsol}
                onRadioChange={handleRadioChange}
            />
        </main>
    );
}
