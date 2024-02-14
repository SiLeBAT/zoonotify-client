import React from "react";
import { Layout } from "../../shared/components/layout/LayoutComponent";
import { PrevalenceMainContent } from "../components/PrevalenceMainContent";
import { PrevalenceSideContent } from "../components/PrevalenceSideContent";
import { SelectionProvider } from "../components/SelectionContext"; // Import the provider
import { usePrevalencePageComponent } from "./prevalenceUseCases";

export function PrevalenceMainComponent(): React.ReactElement {
    const { model } = usePrevalencePageComponent();

    // The state is now managed in SelectionProvider, so no need for useState here

    return (
        <SelectionProvider>
            {" "}
            {/* Wrap the relevant components in the provider */}
            <Layout
                side={<PrevalenceSideContent />}
                sidebarTitle={model.sideBarTitle}
                main={<PrevalenceMainContent heading={model.mainHeading} />}
            />
        </SelectionProvider>
    );
}
