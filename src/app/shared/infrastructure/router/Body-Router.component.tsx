import React from "react";
import { Route, Switch } from "react-router-dom";
import { EvaluationsMainComponent } from "../../../evaluations/pages/EvaluationsMainComponent";
import { DataProtectionPageComponent } from "../../../pages/data_protection/DataProtectionPage.component";
import { ErrorPageComponent } from "../../../pages/error/ErrorPage.component";
import { InfoPageContainer } from "../../../explanation/pages/InfoPage-Container.component"; // Updated import
import { LinkPageComponent } from "../../../pages/links/LinkPage.component";
import { WelcomeMainComponent } from "../../../welcome/pages/WelcomeMainComponent";
import { pageRoute } from "./routes";

function ErrorPage(): JSX.Element {
    return <ErrorPageComponent errorStatus={404} />;
}

export function BodyRouterComponent(): JSX.Element {
    return (
        <Switch>
            <Route
                exact
                path={pageRoute.homePagePath}
                component={WelcomeMainComponent}
            />
            <Route
                path={pageRoute.infoPagePath}
                component={InfoPageContainer} // Use the named export here
            />
            <Route
                path={pageRoute.evaluationsPagePath}
                component={EvaluationsMainComponent}
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
