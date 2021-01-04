import React from "react";
import { useTranslation } from "react-i18next";
import {
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@material-ui/core";

export function ExportTextContentComponent(): JSX.Element {
    const { t } = useTranslation(["Export"]);

    return (
        <div>
            <DialogTitle>{t("Content.Title")}</DialogTitle>
            <DialogContent>
                <DialogContentText>{t("Content.Text")}</DialogContentText>
            </DialogContent>
        </div>
    );
}
