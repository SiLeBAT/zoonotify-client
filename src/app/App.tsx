import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import React, { ReactElement, Suspense, useEffect } from "react";
import * as ReactDOM from "react-dom";
import "../i18n";
import { LoadingProcessComponent } from "./shared/components/loading_process/LoadingProcess.component";
import { MainLayoutComponent } from "./shared/layout/Main-Layout.component";
import { znTheme } from "./shared/style/Style-MainTheme";

const theme = znTheme;

function detectMobileDevice(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /iphone|ipod|android|ie|blackberry|fennec/.test(userAgent);
    return isMobile;
}

function App(): ReactElement {
    useEffect(() => {
        if (detectMobileDevice()) {
            alert(
                "Please note: The Zoonotify Webapp has not been optimized for mobile screens."
            );
        }
    }, []);

    return <MainLayoutComponent />;
}

ReactDOM.render(
    <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
            <Suspense fallback={<LoadingProcessComponent />}>
                <App />
            </Suspense>
        </ThemeProvider>
    </StyledEngineProvider>,
    document.querySelector("#application")
);
