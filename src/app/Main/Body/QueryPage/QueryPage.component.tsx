/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useState } from "react";
import { ValueType } from "react-select";
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
    handleChangeDisplFeatures: (
        selectedOption: ValueType<{value: string, label: string}>,
        keyName: FilterType | TableType
    ) => void;
    handleSwapDisplFeatures: () => void;
    handleRemoveAllDisplFeatures: () => void;
    handleChangeFilter: (
        selectedOption: ValueType<{value: string, label: string}>,
        keyName: FilterType | TableType
    ) => void;
    handleRemoveAllFilter: () => void;
    handleRadioChange: (eventTargetValue: string) => void;
}): JSX.Element {
    const [drawerWidth, setDrawerWidth] = useState(433);
    const [open, setOpen] = useState(true);

    const handleDrawer = (): void => {
        if (open) {
            setOpen(false);
        } else {
            setOpen(true);
        }
    };

    const handleResize = (newWidth: number): void => {
        setDrawerWidth(newWidth);
    };

    return (
        <main css={mainStyle}>
            <DrawerLayoutComponent
                isOpen={open}
                newWidth={drawerWidth}
                handleChangeDisplFeatures={props.handleChangeDisplFeatures}
                handleSwapDisplFeatures={props.handleSwapDisplFeatures}
                handleRemoveAllDisplFeatures={props.handleRemoveAllDisplFeatures}
                handleChangeFilter={props.handleChangeFilter}
                handleRemoveAllFilter={props.handleRemoveAllFilter}
            />
            <QueryPageDrawerControlComponent
                isOpen={open}
                newWidth={drawerWidth}
                handleDrawer={handleDrawer}
                handleResize={handleResize}
            />
            <QueryPageContentComponent
                isCol={props.isCol}
                isRow={props.isRow}
                isFilter={props.isFilter}
                handleRadioChange={props.handleRadioChange}
            />
        </main>
    );
}
