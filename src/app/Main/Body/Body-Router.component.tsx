import React from "react";
import { Route, Switch } from "react-router-dom";
import { QueryPageContainerComponent } from "./QueryPage/QueryPage-Container.component";
import { HomePageLayoutComponent } from "./HomePage/HomePage-Layout.component";
import { LinkPageComponent } from "./LinkPage/LinkPage.component";
import { InfoPageComponent } from "./InfoPage/InfoPage.component";
import { DataProtectionPageComponent } from "./DataProtectionPage/DataProtectionPage.component";
import { ZNPaths } from "../../Shared/URLs";

const PageNotFound = (): JSX.Element => (
    <div>
        <p>404! Page Not Found</p>
    </div>
);

export function BodyRouterComponent(): JSX.Element {
    return (
        <Switch>
            <Route
                exact
                path={ZNPaths.homePagePath}
                component={HomePageLayoutComponent}
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
            <Route component={PageNotFound} />
        </Switch>
    );
}
