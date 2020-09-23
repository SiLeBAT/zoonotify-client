import React from "react";
import {
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@material-ui/core";

export function DialogContentComponent(): JSX.Element {
    return (
        <div>
            <DialogTitle id="form-dialog-title">Export Settings</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    You can choose whether to download the complete data set or
                    the displayed statistics or both.
                </DialogContentText>
            </DialogContent>
        </div>
    );
}
