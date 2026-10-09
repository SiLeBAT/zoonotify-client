import React from "react";
import { Route, Switch } from "react-router-dom";
import { EvaluationsMainComponent } from "../../../evaluations/pages/EvaluationsMainComponent";
import { InfoPageContainer } from "../../../explanation/pages/InfoPage-Container.component";
import { DataProtectionPageComponent } from "../../../pages/data_protection/DataProtectionPage.component";
import { ErrorPageComponent } from "../../../pages/error/ErrorPage.component";
import { LinkPageComponent } from "../../../pages/links/LinkPage.component";
import { PrevalenceMainComponent } from "../../../prevalence/pages/PrevalenceMainComponent";
import { WelcomeMainComponent } from "../../../welcome/pages/WelcomeMainComponent";
// 1) Import your new AntibioticResistance page:
import { AntibioticResistancePageComponent } from "../../../antibiotic_resistance/pages/AntibioticResistancePage.component";
import { AntimicrobialPageComponent } from "../../../antimicrobial/pages/AntimicrobialPage.component";
import { MicrobialCountsPageComponent } from "../../../microbial_counts/pages/MicrobialCountsPage.component";

import { pageRoute } from "./routes";
import { useSeo } from "../../seo/useSeo";
import { useLanguageUrlSync } from "../../seo/useLanguageUrlSync";

function ErrorPage(): JSX.Element {
    return <ErrorPageComponent errorStatus={404} />;
}

export function BodyRouterComponent(): JSX.Element {
    // Mounted here, inside the router but above the Switch, so they run for
    // every route -- including any added later without a matching wiring step.
    // Keeping the language sync in one place is what stopped the per-page
    // effects from writing two different parameter names at each other.
    useLanguageUrlSync();
    useSeo();

    return (
        <Switch>
            <Route
                exact
                path={pageRoute.homePagePath}
                component={WelcomeMainComponent}
            />
            <Route
                path={pageRoute.infoPagePath}
                component={InfoPageContainer}
            />
            <Route
                path={pageRoute.evaluationsPagePath}
                component={EvaluationsMainComponent}
            />
            <Route
                path={pageRoute.prevalencePagePath}
                component={PrevalenceMainComponent}
            />

            {/* 2) Add the new route here, between Prevalence and Links */}
            <Route
                path={pageRoute.antibioticResistancePagePath}
                component={AntibioticResistancePageComponent}
            />

            <Route
                path={pageRoute.antimicrobialPagePath}
                component={AntimicrobialPageComponent}
            />

            <Route
                path={pageRoute.microbialCountsPagePath}
                component={MicrobialCountsPageComponent}
            />

            <Route
                path={pageRoute.linkPagePath}
                component={LinkPageComponent}
            />
            <Route
                path={pageRoute.dpdPagePath}
                component={DataProtectionPageComponent}
            />
            <Route component={ErrorPage} />
        </Switch>
    );
}
