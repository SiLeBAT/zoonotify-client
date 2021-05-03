import React from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@material-ui/core";

export function DialogComponent(props: {
    isOpen: boolean;
    dialogTitle: string;
    dialogContentText: JSX.Element;
    dialogContent: JSX.Element;
    dialogButtons: JSX.Element;
    onClose: () => void;
}): JSX.Element {
    const handleClose = (): void => props.onClose();

    return (
        <Dialog
            open={props.isOpen}
            onClose={handleClose}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle>{props.dialogTitle}</DialogTitle>
            <DialogContent>
                {props.dialogContentText}
                {props.dialogContent}
                {props.dialogButtons}
            </DialogContent>
        </Dialog>
    );
}
