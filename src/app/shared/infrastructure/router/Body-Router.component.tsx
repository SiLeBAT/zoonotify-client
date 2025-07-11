import React from "react";
import { Route, Switch } from "react-router-dom";
import { EvaluationsMainComponent } from "../../../evaluations/pages/EvaluationsMainComponent";
import { InfoPageContainer } from "../../../explanation/pages/InfoPage-Container.component";
import { LinkedDataComponent } from "../../../ld/pages/LinkedDataComponent";
import { DataProtectionPageComponent } from "../../../pages/data_protection/DataProtectionPage.component";
import { ErrorPageComponent } from "../../../pages/error/ErrorPage.component";
import { LinkPageComponent } from "../../../pages/links/LinkPage.component";
import { PrevalenceMainComponent } from "../../../prevalence/pages/PrevalenceMainComponent";
import { WelcomeMainComponent } from "../../../welcome/pages/WelcomeMainComponent";
// 1) Import your new AntibioticResistance page:
import { AntibioticResistancePageComponent } from "../../../antibiotic_resistance/pages/AntibioticResistancePage.component";
import { AntimicrobialPageComponent } from "../../../antimicrobial/pages/AntimicrobialPage.component";

import { pageRoute } from "./routes";

function ErrorPage(): JSX.Element {
    return <ErrorPageComponent errorStatus={404} />;
}

export function BodyRouterComponent(): JSX.Element {
    const showLD = process.env.REACT_APP_SHOW_LD === "true";

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
                path={pageRoute.linkPagePath}
                component={LinkPageComponent}
            />
            <Route
                path={pageRoute.dpdPagePath}
                component={DataProtectionPageComponent}
            />
            {showLD && (
                <Route
                    path={pageRoute.linkedDataPagePath}
                    component={LinkedDataComponent}
                />
            )}

            <Route component={ErrorPage} />
        </Switch>
    );
}
