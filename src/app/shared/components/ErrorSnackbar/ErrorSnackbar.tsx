import React from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { useTranslation } from "react-i18next";
import { errorColor } from "../../style/Style-MainTheme";

interface CustomAlertProps {
    children?: React.ReactNode;
    onClose?: () => void;
    severity?: "error" | "info" | "success" | "warning";
    sx?: object;
}

const Alert = React.forwardRef<HTMLDivElement, CustomAlertProps>(
    (props, ref) => {
        return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
    }
);

interface ErrorSnackbarProps {
    open: boolean;
    handleClose: () => void;
    children?: React.ReactNode;
}

export const ErrorSnackbar: React.FC<ErrorSnackbarProps> = ({
    open,
    handleClose,
}) => {
    const { t } = useTranslation(["ErrorPage"]);

    return (
        <Snackbar
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            sx={{ mt: 2, width: "auto" }}
        >
            <Alert
                onClose={handleClose}
                severity="error"
                sx={{
                    width: "300%",
                    // White on BfR red is 6.2:1; on pure "red" it fails WCAG AA
                    backgroundColor: errorColor,
                    color: "#fff",
                    fontSize: "1rem",
                    padding: "6px 24px",
                    minWidth: "300px",
                    maxWidth: "600px",
                }}
            >
                {t("UNKNOWN-ERROR")}
            </Alert>
        </Snackbar>
    );
};
