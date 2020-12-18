import React from "react";
import { Route, Switch } from "react-router-dom";
import { QueryPageContainerComponent as QueryPage } from "./QueryPage/QueryPage-Container.component";
import { HomePageLayoutComponent as HomePage } from "./HomePage/HomePage.component";
import { LinkPageComponent as LinkPage } from "./LinkPage/LinkPage.component";
import { InfoPageComponent as InfoPage } from "./InfoPage/InfoPage.component";
import { DataProtectionPageComponent as DataProtection } from "./DataProtectionPage/DataProtectionPage.component";
import { ZNPaths } from "../../Shared/URLs";

const PageNotFound = (): JSX.Element => (
    <div>
        <p>404! Page Not Found</p>
    </div>
);

export function BodyRouterComponent(): JSX.Element {
    return (
        <Switch>
            <Route exact path={ZNPaths.homePagePath} component={HomePage} />
            <Route path={ZNPaths.infoPagePath} component={InfoPage} />
            <Route path={ZNPaths.queryPagePath} component={QueryPage} />
            <Route path={ZNPaths.linkPagePath} component={LinkPage} />
            <Route path={ZNPaths.dpdPagePath} component={DataProtection} />
            <Route component={PageNotFound} />
        </Switch>
    );
}
