import React from "react";

import { MainWithSideLayout } from "../../shared/components/layout/MainWithSideLayoutComponent";
import { EvaluationDataProvider } from "../components/EvaluationDataContext";
import { EvaluationMainContent } from "../components/EvaluationMainContent";
import { EvaluationSideContent } from "../components/EvaluationSideContent";
import { useEvaluationPageComponent } from "./evaluationsPageUseCases";

export function EvaluationsMainComponent(): React.ReactElement {
    const { model } = useEvaluationPageComponent();

    return (
        <EvaluationDataProvider>
            <MainWithSideLayout
                side={<EvaluationSideContent />}
                sidebarTitle={model.sideBarTitle}
                main={<EvaluationMainContent heading={model.mainHeading} />}
            />
        </EvaluationDataProvider>
    );
}
