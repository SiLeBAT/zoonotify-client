import React from "react";
import { Button, DialogActions } from "@material-ui/core";
import DoneIcon from "@material-ui/icons/Done";
import { useTranslation } from "react-i18next";

export function FilterDialogButtonsComponent(props: {
    onFiltersToDisplayCancel: () => void;
    onFiltersToDisplaySubmit: () => void;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    const handleCancelFiltersToDisplay = (): void => {
        props.onFiltersToDisplayCancel();
    };

    const handleSubmitFiltersToDisplay = (): void => {
        props.onFiltersToDisplaySubmit();
    };

    return (
        <DialogActions>
            <Button onClick={handleCancelFiltersToDisplay} color="primary">
                {t("FilterDialog.Cancel")}
            </Button>
            <Button type="submit" onClick={handleSubmitFiltersToDisplay} color="primary">
                <DoneIcon fontSize="small" />
                {t("FilterDialog.Submit")}
            </Button>
        </DialogActions>
    );
}
