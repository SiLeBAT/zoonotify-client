import React, { useState } from "react";
import { MainContentComponent } from "./MainContentComponent";
import { SidebarComponent } from "./SidebarComponent";

interface LayoutProps {
    side: React.ReactNode;
    sidebarTitle: string;
    main: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
    side,
    main,
    sidebarTitle,
}): JSX.Element => {
    const [showFilters, setShowFilters] = useState(true);

    const handleFilterBtnClick = (): void => {
        setShowFilters(!showFilters);
    };

    return (
        <div style={{ display: "flex" }}>
            <SidebarComponent
                showFilters={showFilters}
                handleFilterBtnClick={handleFilterBtnClick}
                title={sidebarTitle}
            >
                {side}
            </SidebarComponent>
            <MainContentComponent>{main}</MainContentComponent>
        </div>
    );
};
