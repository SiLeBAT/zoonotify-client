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

export interface DialogButton {
    content: JSX.Element | string;
    disabled?: boolean;
    onClick: () => void;
}

export function DialogComponent(props: {
    dialogTitle: JSX.Element | string;
    dialogContentText: JSX.Element | string;
    dialogContent: JSX.Element;
    cancelButton: DialogButton;
    // eslint-disable-next-line react/require-default-props
    submitButton?: DialogButton;
    loading: boolean;
}): JSX.Element {
    const theme = useTheme();

    const handleClose = (): void => props.cancelButton.onClick();

    const handleClickCancel = (): void => props.cancelButton.onClick();

    let submitButtonBox;
    if (props.submitButton !== undefined) {
        const onSubmitClick = props.submitButton.onClick;
        const handleClickSubmit = (): void => onSubmitClick();
        submitButtonBox = (
            <Box
                sx={{
                    margin: theme.spacing(1),
                    position: "relative",
                }}
            >
                <Button
                    onClick={handleClickSubmit}
                    color="primary"
                    disabled={props.submitButton.disabled || props.loading}
                >
                    {props.submitButton.content}
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
        );
    }

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
                    {props.cancelButton.content}
                </Button>
                {submitButtonBox}
            </DialogActions>
        </Dialog>
    );
}
