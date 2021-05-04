import React from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@material-ui/core";

export function DialogComponent(props: {
    isOpen: boolean;
    dialogTitle: string;
    dialogContentText: JSX.Element | string;
    dialogContent: JSX.Element;
    cancelButton: JSX.Element | string;
    submitButton: JSX.Element | string;
    disableSubmitButton: boolean;
    onClose: () => void;
    onCancelClick: () => void;
    onSubmitClick: () => void;
}): JSX.Element {
    const handleClose = (): void => props.onClose();

    const handleClickCancel = (): void => props.onCancelClick();

    const handleClickSubmit = (): void => props.onSubmitClick();

    return (
        <Dialog
            open={props.isOpen}
            onClose={handleClose}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle>{props.dialogTitle}</DialogTitle>
            <DialogContent>
                <DialogContentText>{props.dialogContentText}</DialogContentText>
                {props.dialogContent}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClickCancel} color="primary">
                    {props.cancelButton}
                </Button>
                <Button
                    onClick={handleClickSubmit}
                    color="primary"
                    disabled={props.disableSubmitButton}
                >
                    {props.submitButton}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
