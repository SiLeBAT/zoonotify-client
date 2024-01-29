import React from "react";
import { Layout } from "../../shared/components/layout/LayoutComponent";
import { PrevalenceMainContent } from "../components/PrevalenceMainContent";
import { PrevalenceSideContent } from "../components/PrevalenceSideContent";
import { usePrevalencePageComponent } from "./prevalenceUseCases";

export function PrevalenceMainComponent(): React.ReactElement {
    const { model } = usePrevalencePageComponent();

    return (
        <div>
            <Layout
                side={<PrevalenceSideContent />}
                sidebarTitle={model.sideBarTitle}
                main={<PrevalenceMainContent heading={model.mainHeading} />}
            />
        </div>
    );
}
