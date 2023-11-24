import React from "react";
import { Route, Switch } from "react-router-dom";
import { EvaluationsMainComponent } from "../../../evaluations/pages/EvaluationsMainComponent";
import { DataProtectionPageComponent } from "../../../pages/data_protection/DataProtectionPage.component";
import { ErrorPageComponent } from "../../../pages/error/ErrorPage.component";

import { InfoPageContainerComponent } from "../../../explanation/pages/InfoPage-Container.component";
import { LinkPageComponent } from "../../../pages/links/LinkPage.component";
import { WelcomeMainComponent } from "../../../welcome/pages/WelcomeMainComponent";
import { pageRoute } from "./routes";
import { LinkedDataComponent } from "../../../ld/pages/LinkedDataComponent";

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
                component={InfoPageContainerComponent}
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
            <Route
                path={pageRoute.linkedDataPagePath}
                component={LinkedDataComponent}
            />
            <Route component={ErrorPage} />
        </Switch>
    );
}
