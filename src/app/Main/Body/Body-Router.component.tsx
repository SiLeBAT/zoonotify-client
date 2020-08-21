import React from "react";
import { Route, Switch } from "react-router-dom";
import { QueryPageLayoutComponent as QueryPage } from "./QueryPage/QueryPage-Layout.component";
import { HomePageLayoutComponent as HomePage } from "./HomePage/HomePage.component";
import { DataProtectionPageComponent as DataProtection } from "./DataProtectionPage/DataProtectionPage.component";
import { ZNPaths } from "../../Shared/URLs";

const PageNotFound = (): JSX.Element => (
    <div>
        <h3>404! Page Not Found</h3>
    </div>
);

export function BodyRouterComponent(): JSX.Element {
    return (
        <Switch>
            <Route exact path={ZNPaths.homePagePath} component={HomePage} />
            <Route path={ZNPaths.queryPagePath} component={QueryPage} />
            <Route path={ZNPaths.dpdPagePath} component={DataProtection} />
            <Route component={PageNotFound} />
        </Switch>
    );
}
