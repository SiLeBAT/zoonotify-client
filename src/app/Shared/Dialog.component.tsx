import React from "react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Theme,
} from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { primaryColor } from "./Style/Style-MainTheme.component";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        wrapper: {
            margin: theme.spacing(1),
            position: "relative",
        },
        buttonProgress: {
            color: `${primaryColor}`,
            position: "absolute",
            top: "50%",
            left: "50%",
            marginTop: -12,
            marginLeft: -12,
        },
    })
);

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
    const classes = useStyles();

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
                <div className={classes.wrapper}>
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
                            className={classes.buttonProgress}
                        />
                    )}
                </div>
            </DialogActions>
        </Dialog>
    );
}
