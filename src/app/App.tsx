import React, { Suspense } from "react";
import * as ReactDOM from "react-dom";
import { StylesProvider } from "@material-ui/core/styles";
import { CheckServerConnectionComponent } from "./Main/CheckServerConnection.component";
import "../i18n";
import { FilterProvider } from "./Shared/Context/FilterContext";
import { DataProvider } from "./Shared/Context/DataContext";
import { TableProvider } from "./Shared/Context/TableContext";

ReactDOM.render(
    <Suspense fallback={<div>Loading</div>}>
        <FilterProvider>
            <DataProvider>
                <TableProvider>
                    <StylesProvider injectFirst>
                        <CheckServerConnectionComponent />
                    </StylesProvider>
                </TableProvider>
            </DataProvider>
        </FilterProvider>
    </Suspense>,
    document.querySelector("#application")
);
