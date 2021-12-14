import React from "react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";
import { Box, useTheme } from "@mui/system";
import { primaryColor } from "./Style/Style-MainTheme";

export function DialogComponent(props: {
    dialogTitle: JSX.Element | string;
    dialogContentText: JSX.Element | string;
    dialogContent: JSX.Element;
    cancelButton: JSX.Element | string;
    submitButton: JSX.Element | string;
    disableSubmitButton: boolean;
    loading: boolean;
    onClose: () => void;
    onSubmitClick: () => void;
}): JSX.Element {
    const theme = useTheme();

    const handleClose = (): void => props.onClose();

    const handleClickCancel = (): void => props.onClose();

    const handleClickSubmit = (): void => props.onSubmitClick();

    return (
        <Dialog open onClose={handleClose} aria-labelledby="form-dialog-title">
            <DialogTitle>{props.dialogTitle}</DialogTitle>
            <DialogContent>
                <DialogContentText>{props.dialogContentText}</DialogContentText>
                {props.dialogContent}
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleClickCancel}
                    color="primary"
                    disabled={props.loading}
                >
                    {props.cancelButton}
                </Button>
                <Box
                    sx={{
                        margin: theme.spacing(1),
                        position: "relative",
                    }}
                >
                    <Button
                        onClick={handleClickSubmit}
                        color="primary"
                        disabled={props.disableSubmitButton || props.loading}
                    >
                        {props.submitButton}
                    </Button>
                    {props.loading && (
                        <CircularProgress
                            size={24}
                            sx={{
                                color: `${primaryColor}`,
                                position: "absolute",
                                top: "10%",
                                left: "40%",
                            }}
                        />
                    )}
                </Box>
            </DialogActions>
        </Dialog>
    );
}
