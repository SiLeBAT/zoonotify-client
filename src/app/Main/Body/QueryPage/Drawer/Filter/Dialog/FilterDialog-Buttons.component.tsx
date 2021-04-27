import React from "react";
import { Button, DialogActions } from "@material-ui/core";
import DoneIcon from "@material-ui/icons/Done";
import { useTranslation } from "react-i18next";

export function FilterDialogButtonsComponent(props: {
    onHandleCancelClick: () => void;
    onHandleSubmitClick: () => void;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    const handleClickCancel = (): void => {
        props.onHandleCancelClick();
    };

    const handleClickSubmit = (): void => {
        props.onHandleSubmitClick();
    };

    return (
        <DialogActions>
            <Button onClick={handleClickCancel} color="primary">
                {t("FilterDialog.Cancel")}
            </Button>
            <Button type="submit" onClick={handleClickSubmit} color="primary">
                <DoneIcon fontSize="small" />
                {t("FilterDialog.Submit")}
            </Button>
        </DialogActions>
    );
}
