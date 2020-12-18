/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useState } from "react";
import { ClippedDrawer as DrawerMenu } from "./Drawer/Drawer-Layout.component";
import { DrawerControlComponent as DrawerControl} from "./Drawer/ControlBar/QueryPage-DrawerControl.component";
import { QueryPageContentComponent as QueryPageContent} from "./QueryPage-Content.component";

const mainStyle = css`
    height: 100%;
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
`;

export function QueryPageComponent(): JSX.Element {
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
            <DrawerMenu isOpen={open} newWidth={drawerWidth}/>
            <DrawerControl isOpen={open} newWidth={drawerWidth} handleDrawer={handleDrawer} handleResize={handleResize}/>
            <QueryPageContent />
        </main>
    );
}
