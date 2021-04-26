import React from "react";
import { Button, DialogActions } from "@material-ui/core";
import DoneIcon from "@material-ui/icons/Done";


export function FilterDialogButtonsComponent(props: {
    onHandleCancelClick: () => void;
    onHandleSubmitClick: () => void;
}): JSX.Element {
    const handleClickCancel = (): void => {
        props.onHandleCancelClick();
    };

    const handleClickSubmit = (): void => {
        props.onHandleSubmitClick();
    };

    return (
        <DialogActions>
            <Button onClick={handleClickCancel} color="primary">
                Cancel
            </Button>
            <Button type="submit" onClick={handleClickSubmit} color="primary">
                <DoneIcon fontSize="small" />
                Submit
            </Button>
        </DialogActions>
    );
}
