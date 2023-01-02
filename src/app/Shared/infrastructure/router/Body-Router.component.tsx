import React from "react";
import { Route, Switch } from "react-router-dom";
import { DataProtectionPageComponent } from "../../../pages/data_protection/DataProtectionPage.component";
import { ErrorPageComponent } from "../../../pages/error/ErrorPage.component";
import { EvaluationsPageContainerComponent } from "../../../pages/evaluations/EvaluationsPage-Container.component";
import { InfoPageContainerComponent } from "../../../pages/information/InfoPage-Container.component";
import { LinkPageComponent } from "../../../pages/links/LinkPage.component";
import { WelcomePage } from "../../../pages/welcome/welcome_page";
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
                component={WelcomePage}
            />
            <Route
                path={pageRoute.infoPagePath}
                component={InfoPageContainerComponent}
            />
            <Route
                path={pageRoute.evaluationsPagePath}
                component={EvaluationsPageContainerComponent}
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
