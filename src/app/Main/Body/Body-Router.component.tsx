import React from "react";
import { Route, Switch } from "react-router-dom";
import { FilterPageLayoutComponent as FilterPage } from "./FilterPage/FilterPage-Layout.component";
import { HomePageLayoutComponent as HomePage } from "./HomePage/HomePage.component";
import { DataProtectionPageComponent as DataProtection } from "./DataProtectionPage/DataProtectionPage.component";
import { DBentry, DBtype } from "../../Shared/Isolat.model";

const PageNotFound = (): JSX.Element => (
    <div>
        <h3>404! Page Not Found</h3>
    </div>
);

interface BodyProps {
    data: DBentry[];
    keyValues: DBtype[];
}

export function BodyRouterComponent(props: BodyProps): JSX.Element {
    return (
        <Switch>
            <Route exact path="/" component={HomePage} />
            <Route
                path="/filter"
                component={() => (
                    <FilterPage data={props.data} keyValues={props.keyValues} />
                )}
            />
            <Route
                path="/dataprotectiondeclaration"
                component={DataProtection}
            />
            <Route component={PageNotFound} />
        </Switch>
    );
}
