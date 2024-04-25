import React from "react";
import { MainWithSideLayout } from "../../shared/components/layout/MainWithSideLayoutComponent";
import { PrevalenceDataProvider } from "../components/PrevalenceDataContext"; // Import the provider
import PrevalenceMainContent  from "../components/PrevalenceMainContent";
import { PrevalenceSideContent } from "../components/PrevalenceSideContent";
import { usePrevalencePageComponent } from "./prevalenceUseCases";
import { PageLayoutComponent } from "../../shared/components/layout/PageLayoutComponent";

export function PrevalenceMainComponent(): React.ReactElement {
    const { model } = usePrevalencePageComponent();

    // The state is now managed in SelectionProvider, so no need for useState here

    return (
        <PageLayoutComponent>
            <PrevalenceDataProvider>
                <MainWithSideLayout
                    side={<PrevalenceSideContent />}
                    sidebarTitle={model.sideBarTitle}
                    main={<PrevalenceMainContent heading={model.mainHeading} />}
                />
            </PrevalenceDataProvider>
        </PageLayoutComponent>
    );
}
