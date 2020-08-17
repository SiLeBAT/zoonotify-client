import React, { Suspense } from "react";
import * as ReactDOM from "react-dom";
import { StylesProvider } from "@material-ui/core/styles";
import { MainContainerComponent } from "./Main/Main-Container.component";
import "../i18n";
import { FilterProvider } from "./Shared/Context/FilterContext";
import { DataProvider } from "./Shared/Context/DataContext";

ReactDOM.render(
    <Suspense fallback={<div>Loading</div>}>
        <FilterProvider>
            <DataProvider>
                <StylesProvider injectFirst>
                    <MainContainerComponent />
                </StylesProvider>
            </DataProvider>
        </FilterProvider>
    </Suspense>,
    document.querySelector("#application")
);
