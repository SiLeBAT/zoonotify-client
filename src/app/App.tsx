import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import React, { ReactElement, Suspense, useEffect } from "react";
import * as ReactDOM from "react-dom";
import "../i18n";
import { LoadingProcessComponent } from "./shared/components/loading_process/LoadingProcess.component";
import { MainLayoutComponent } from "./shared/layout/Main-Layout.component";
import { znTheme } from "./shared/style/Style-MainTheme";
import { useTranslation } from "react-i18next";

const theme = znTheme;

function detectMobileDevice(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /iphone|ipod|android|ie|blackberry|fennec/.test(userAgent);
    return isMobile;
}

function App(): ReactElement {
    const { t } = useTranslation(["ErrorPage"]);

    useEffect(() => {
        if (detectMobileDevice()) {
            alert(
                t(
                    "PLEASE NOTE: THE ZOONOTIFY WEBAPP HAS NOT BEEN OPTIMIZED FOR MOBILE SCREENS."
                )
            );
        }
    }, [t]);

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
