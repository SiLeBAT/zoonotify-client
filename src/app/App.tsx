import React, {
    ReactElement,
    Suspense,
    useEffect,
    useState,
    forwardRef,
} from "react";
import * as ReactDOM from "react-dom";
import {
    StyledEngineProvider,
    ThemeProvider,
    Snackbar,
    Alert as MuiAlert,
} from "@mui/material";
import { LoadingProcessComponent } from "./shared/components/loading_process/LoadingProcess.component";
import { MainLayoutComponent } from "./shared/layout/Main-Layout.component";
import { znTheme } from "./shared/style/Style-MainTheme";
import { useTranslation } from "react-i18next";
import "../i18n";

const theme = znTheme;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Alert = forwardRef<HTMLDivElement, any>((props, ref) => (
    <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

function detectMobileDevice(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /iphone|ipod|android|ie|blackberry|fennec/.test(userAgent);
    return isMobile;
}

const App = (): ReactElement => {
    const { t } = useTranslation("ErrorPage");
    const [openSnackbar, setOpenSnackbar] = useState(false);

    useEffect(() => {
        if (detectMobileDevice()) {
            setOpenSnackbar(true);
        }
    }, [t]);

    const handleCloseSnackbar = (
        _event?: React.SyntheticEvent | Event,
        reason?: string
    ): void => {
        if (reason === "clickaway") {
            return;
        }
        setOpenSnackbar(false);
    };

    return (
        <>
            <MainLayoutComponent />
            <Snackbar
                open={openSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                onClose={handleCloseSnackbar}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity="warning"
                    sx={{ width: "100%" }}
                >
                    {t("SmartPhone Detected")}
                </Alert>
            </Snackbar>
        </>
    );
};

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
