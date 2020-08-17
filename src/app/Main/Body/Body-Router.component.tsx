import React from "react";
import { Route, Switch } from "react-router-dom";
import { QueryPageLayoutComponent as QueryPage } from "./QueryPage/QueryPage-Layout.component";
import { HomePageLayoutComponent as HomePage } from "./HomePage/HomePage.component";
import { DataProtectionPageComponent as DataProtection } from "./DataProtectionPage/DataProtectionPage.component";

const PageNotFound = (): JSX.Element => (
    <div>
        <h3>404! Page Not Found</h3>
    </div>
);

export function BodyRouterComponent(): JSX.Element {
    return (
        <Switch>
            <Route exact path="/" component={HomePage} />
            <Route path="/filter" component={QueryPage} />
            <Route
                path="/dataprotectiondeclaration"
                component={DataProtection}
            />
            <Route component={PageNotFound} />
        </Switch>
    );
}
