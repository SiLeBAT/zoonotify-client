import React, { useState } from "react";
import { SidebarComponent } from "../../shared/components/sideBar/SidebarComponent";
import { MainContentComponent } from "./MainContentComponent";
import { useEvaluationPageComponent } from "./evaluationsUseCases";

interface LayoutProps {
    side: React.ReactNode;
    main: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ side, main }): JSX.Element => {
    const { model, operations } = useEvaluationPageComponent();
    const [showFilters, setShowFilters] = useState(true);

    const handleFilterBtnClick = (): void => {
        setShowFilters(!showFilters);
    };

    return (
        <div style={{ display: "flex" }}>
            <SidebarComponent
                showFilters={showFilters}
                handleFilterBtnClick={handleFilterBtnClick}
                handleSearchBtnClick={operations.updateFilters}
                selectionConfig={model.selectionConfig}
                searchButtonText={model.searchButtonText}
                howToHeading={model.howToHeading}
                howToContent={model.howto}
            >
                {side}
            </SidebarComponent>
            <MainContentComponent model={model} operations={operations}>
                {() => main}
            </MainContentComponent>
        </div>
    );
};
