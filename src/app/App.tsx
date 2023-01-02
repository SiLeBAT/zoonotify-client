import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import React, { Suspense } from "react";
import * as ReactDOM from "react-dom";
import "../i18n";
import { LoadingProcessComponent } from "./shared/components/loading_process/LoadingProcess.component";
import { MainLayoutComponent } from "./shared/layout/Main-Layout.component";
import { znTheme } from "./shared/style/Style-MainTheme";

const theme = znTheme;

ReactDOM.render(
    <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
            <Suspense fallback={<LoadingProcessComponent />}>
                <MainLayoutComponent />
            </Suspense>
        </ThemeProvider>
    </StyledEngineProvider>,
    document.querySelector("#application")
);
