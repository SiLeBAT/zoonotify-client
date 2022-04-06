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
                    sx={{
                        backgroundColor: theme.palette.primary.main,
                    }}
                    disabled={props.submitButton.disabled || props.loading}
                    variant="contained"
                >
                    {props.submitButton.content}
                </Button>
                {props.loading && (
                    <CircularProgress
                        size={24}
                        sx={{
                            color: theme.palette.primary.main,
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
                    sx={{
                        color: theme.palette.primary.main,
                    }}
                    disabled={props.loading}
                >
                    {props.cancelButton.content}
                </Button>
                {submitButtonBox}
            </DialogActions>
        </Dialog>
    );
}
