import { Box } from "@mui/material";
import React, { useState } from "react";
import { MainContentComponent } from "./MainContentComponent";
import { SidebarComponent } from "./SidebarComponent";

interface LayoutProps {
    side: React.ReactNode;
    sidebarTitle: string;
    main: React.ReactNode;
}

export const MainWithSideLayout: React.FC<LayoutProps> = ({
    side,
    main,
    sidebarTitle,
}): JSX.Element => {
    const [isOpen, setIsOpen] = useState(true);

    const handleOpenClick = (): void => {
        setIsOpen(!isOpen);
    };

    return (
        <Box
            style={{
                display: "flex",
                // Fill the main scroll area handed to us by PageLayoutComponent.
                // Use 100% (not 100vw/100vh) so the box tracks its container and
                // never overflows by the scrollbar width or the header height.
                width: "100%",
                height: "100%",
                maxHeight: "100%",
                // Clip and allow the row to shrink so a tall sidebar/content pane
                // scrolls inside its own panel instead of stretching this row and
                // forcing main to scroll.
                minHeight: 0,
                overflow: "hidden",
            }}
        >
            <SidebarComponent
                isOpen={isOpen}
                handleOpenClick={handleOpenClick}
                title={sidebarTitle}
            >
                {side}
            </SidebarComponent>
            <MainContentComponent>{main}</MainContentComponent>
        </Box>
    );
};
