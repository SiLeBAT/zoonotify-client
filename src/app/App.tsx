import React, { Suspense } from "react";
import * as ReactDOM from "react-dom";
import { StylesProvider } from "@material-ui/core/styles";
import "../i18n";
import { FilterProvider } from "./Shared/Context/FilterContext";
import { DataProvider } from "./Shared/Context/DataContext";
import { TableProvider } from "./Shared/Context/TableContext";
import { LoadingProcessComponent } from "./Shared/LoadingProcess.component";
import { MainLayoutComponent } from "./Main/Main-Layout.component";

ReactDOM.render(
    <Suspense fallback={<LoadingProcessComponent />}>
        <FilterProvider>
            <DataProvider>
                <TableProvider>
                    <StylesProvider injectFirst>
                        <MainLayoutComponent />
                    </StylesProvider>
                </TableProvider>
            </DataProvider>
        </FilterProvider>
    </Suspense>,
    document.querySelector("#application")
);
