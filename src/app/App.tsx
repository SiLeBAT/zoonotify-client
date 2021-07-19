import React, { Suspense } from "react";
import * as ReactDOM from "react-dom";
import { StylesProvider } from "@material-ui/core/styles";
import "../i18n";
import { FilterProvider } from "./Shared/Context/FilterContext";
import { DataProvider } from "./Shared/Context/DataContext";
import { LoadingProcessComponent } from "./Shared/LoadingProcess.component";
import { MainLayoutComponent } from "./Main/Main-Layout.component";

ReactDOM.render(
    <Suspense fallback={<LoadingProcessComponent />}>
        <FilterProvider>
                <DataProvider>
                    <StylesProvider injectFirst>
                        <MainLayoutComponent />
                    </StylesProvider>
                </DataProvider>
        </FilterProvider>
    </Suspense>,
    document.querySelector("#application")
);
