import React from "react";
import { Route, Switch } from "react-router-dom";
import { FilterPageLayoutComponent as FilterPage } from "./FilterPage/FilterPage-Layout.component";
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
            <Route
                path="/abfrage"
                component={() => (
                    <FilterPage />
                )}
            />
            <Route path="/datenschutzerklaerung" component={DataProtection} />
            <Route component={PageNotFound} />
        </Switch>
    );
}
