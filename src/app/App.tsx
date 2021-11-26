import React, { Suspense } from "react";
import * as ReactDOM from "react-dom";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import "../i18n";
import { FilterProvider } from "./Shared/Context/FilterContext";
import { DataProvider } from "./Shared/Context/DataContext";
import { LoadingProcessComponent } from "./Shared/LoadingProcess.component";
import { MainLayoutComponent } from "./Main/Main-Layout.component";
import { znTheme } from "./Shared/Style/Style-MainTheme";

const theme = znTheme;

ReactDOM.render(
    <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
            <Suspense fallback={<LoadingProcessComponent />}>
                <FilterProvider>
                    <DataProvider>
                        <MainLayoutComponent />
                    </DataProvider>
                </FilterProvider>
            </Suspense>
        </ThemeProvider>
    </StyledEngineProvider>,
    document.querySelector("#application")
);
