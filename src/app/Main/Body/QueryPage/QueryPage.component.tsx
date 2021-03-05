/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useState } from "react";
import { DrawerLayoutComponent } from "./Drawer/Drawer-Layout.component";
import { QueryPageDrawerControlComponent } from "./Drawer/ControlBar/QueryPage-DrawerControl.component";
import { QueryPageContentComponent } from "./QueryPage-Content.component";

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
            <DrawerLayoutComponent isOpen={open} newWidth={drawerWidth} />
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
            />
        </main>
    );
}
