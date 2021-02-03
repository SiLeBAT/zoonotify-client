import React from "react";
import { Route, Switch } from "react-router-dom";
import { QueryPageContainerComponent } from "./QueryPage/QueryPage-Container.component";
import { HomePageComponent } from "./HomePage/HomePage.component";
import { LinkPageComponent } from "./LinkPage/LinkPage.component";
import { InfoPageComponent } from "./InfoPage/InfoPage.component";
import { DataProtectionPageComponent } from "./DataProtectionPage/DataProtectionPage.component";
import { ZNPaths } from "../../Shared/URLs";
import { ErrorPageComponent } from "./ErrorPage/ErrorPage.component";

function ErrorPage(): JSX.Element {
    return <ErrorPageComponent errorStatus={404} />;
}

export function BodyRouterComponent(): JSX.Element {
    return (
        <Switch>
            <Route
                exact
                path={ZNPaths.homePagePath}
                component={HomePageComponent}
            />
            <Route path={ZNPaths.infoPagePath} component={InfoPageComponent} />
            <Route
                path={ZNPaths.queryPagePath}
                component={QueryPageContainerComponent}
            />
            <Route path={ZNPaths.linkPagePath} component={LinkPageComponent} />
            <Route
                path={ZNPaths.dpdPagePath}
                component={DataProtectionPageComponent}
            />
            <Route component={ErrorPage} />
        </Switch>
    );
}
