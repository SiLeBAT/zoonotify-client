import React from "react";
import { Route, Switch } from "react-router-dom";
import { QueryPageLayoutComponent as QueryPage } from "./QueryPage/QueryPage-Layout.component";
import { HomePageLayoutComponent as HomePage } from "./HomePage/HomePage.component";
import { DataProtectionPageComponent as DataProtection } from "./DataProtectionPage/DataProtectionPage.component";
import { homePageURL, queryPageURL, ddpPageURL } from "../../Shared/URLs";

const PageNotFound = (): JSX.Element => (
    <div>
        <h3>404! Page Not Found</h3>
    </div>
);

export function BodyRouterComponent(): JSX.Element {
    return (
        <Switch>
            <Route exact path={homePageURL} component={HomePage} />
            <Route path={queryPageURL} component={QueryPage} />
            <Route path={ddpPageURL} component={DataProtection} />
            <Route component={PageNotFound} />
        </Switch>
    );
}
