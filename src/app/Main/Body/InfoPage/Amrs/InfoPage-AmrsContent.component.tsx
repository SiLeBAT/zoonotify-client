import React, { useState } from "react";
import { Button, Divider } from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { useTranslation } from "react-i18next";
import { AmrKey, AmrsTable, microorganismNames } from "../InfoPage.model";
import { InfoPageAmrDialogComponent } from "./InfoPage-AmrsDialog.component";
import { primaryColor } from "../../../../Shared/Style/Style-MainTheme.component";

const useStyles = makeStyles(() =>
    createStyles({
        button: {
            textAlign: "left",
            backgroundColor: "#f3f7fa",
            "&:hover": {
                backgroundColor: "#dae9f5",
                textDecoration: "underline",
            },
        },
        divider: {
            background: primaryColor,
            width: "50%",
            margin: "auto",
        },
    })
);

export function InfoPageAmrsContentComponent(props: {
    amrKeys: AmrKey[];
    tableData: Record<AmrKey, AmrsTable>;
    onAmrDataExport: (amrKey: AmrKey) => void;
}): JSX.Element {
    const { t } = useTranslation(["InfoPage"]);
    const classes = useStyles();

    const [openAmrDialog, setOpenAmrDialog] = useState<AmrKey | null>(null);

    const handleClose = (): void => {
        setOpenAmrDialog(null);
    };
    const handleExportAmrData = (amrKey: AmrKey): void => {
        props.onAmrDataExport(amrKey);
        setOpenAmrDialog(null);
    };

    const handleOpen = (amrKey: AmrKey): void => {
        setOpenAmrDialog(amrKey);
    };

    return (
        <div>
            <p>
                {t("Methods.Amrs.Paragraph1.Description1")}
                {microorganismNames.Salm} spp., {microorganismNames.CampyJeC},{" "}
                {microorganismNames.CampyColiC}, {microorganismNames.ColiFull}
                {t("Methods.Amrs.Paragraph1.Description2")}
                {microorganismNames.ColiShort}
                {t("Methods.Amrs.Paragraph1.Description3")}
                {microorganismNames.EnteroFaecalisE}
                {t("Methods.Amrs.Paragraph1.Description4")}
                {microorganismNames.EnteroFaecium}
                {t("Methods.Amrs.Paragraph1.Description5")}
                {microorganismNames.Staphy}
                {t("Methods.Amrs.Paragraph1.Description6")}
            </p>
            <p>
                {t("Methods.Amrs.Paragraph2.Description1")}
                {microorganismNames.Salm} spp.
                {t("Methods.Amrs.Paragraph2.Description2")}
                {microorganismNames.ColiShort}
                {t("Methods.Amrs.Paragraph2.Description3")}
                {microorganismNames.Campy} spp.
                {t("Methods.Amrs.Paragraph2.Description4")}
            </p>
            <p>{t("Methods.Amrs.Paragraph3")}</p>
            <p>
                {t("Methods.Amrs.Paragraph4.Description1")}
                {microorganismNames.Entero} spp.
                {t("Methods.Amrs.Paragraph4.Description2")}
                {microorganismNames.Staphy}
                {t("Methods.Amrs.Paragraph4.Description3")}
                {microorganismNames.Salm}, {microorganismNames.Campy}
                {t("Methods.Amrs.Paragraph4.Description4")}
                {microorganismNames.ColiFull}
                {t("Methods.Amrs.Paragraph4.Description5")}
                {microorganismNames.Entero} spp.
                {t("Methods.Amrs.Paragraph4.Description6")}
            </p>
            <Divider
                variant="middle"
                className={classes.divider}
            />
            <p>
                {t("Methods.Amrs.Paragraph5.Description1")}
                {microorganismNames.Salm} spp.
                {t("Methods.Amrs.Paragraph5.Description2")}
                {microorganismNames.ColiFull}
                {t("Methods.Amrs.Paragraph5.Description3")}
            </p>
            {props.amrKeys.map((amrKey) => (
                <div key={`${amrKey}-amr-table-dialog`}>
                    {props.tableData[amrKey].introduction}
                    <Button
                        onClick={() => handleOpen(amrKey)}
                        color="primary"
                        className={classes.button}
                    >
                        {props.tableData[amrKey].title}
                    </Button>
                </div>
            ))}
            {openAmrDialog !== null && (
                <InfoPageAmrDialogComponent
                    resistancesTableData={props.tableData[openAmrDialog]}
                    onClose={handleClose}
                    onAmrDataExport={() => handleExportAmrData(openAmrDialog)}
                />
            )}
        </div>
    );
}
