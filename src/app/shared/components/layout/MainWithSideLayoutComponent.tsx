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
        <Box style={{ display: "flex", width: "100vw", height: "100vh" }}>
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
