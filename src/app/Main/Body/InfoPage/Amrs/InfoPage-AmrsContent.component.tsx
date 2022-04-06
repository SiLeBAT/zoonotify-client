import React, { useState } from "react";
import { Button, Divider, Typography } from "@mui/material";
import { useTheme } from "@mui/system";
import { useTranslation } from "react-i18next";
import { AmrKey, AmrsTable } from "../InfoPage.model";
import { InfoPageAmrDialogComponent } from "./InfoPage-AmrsDialog.component";
import {
    campy,
    campyColiC,
    campyJeC,
    campyLari,
    campySpp,
    coliFull,
    coliFullE,
    coliShort,
    enteroFaecalisE,
    enteroFaecium,
    enteroSpp,
    salm,
    salmSpp,
    staphy,
} from "../italicNames.constants";

export function InfoPageAmrsContentComponent(props: {
    amrKeys: AmrKey[];
    tableData: Record<AmrKey, AmrsTable>;
    onAmrDataExport: (amrKey: AmrKey) => void;
}): JSX.Element {
    const theme = useTheme();
    const { t } = useTranslation(["InfoPage"]);

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
            <Typography component="p" sx={{ paddingBottom: "1em" }}>
                {t("Methods.Amrs.Paragraph1.Description1")}
                {salmSpp}, {campyJeC}, {campyColiC}, {campyLari}, {coliFullE},
                {t("Methods.Amrs.Paragraph1.Description2")}
                {coliShort}
                {t("Methods.Amrs.Paragraph1.Description3")}
                {enteroFaecalisE}
                {t("Methods.Amrs.Paragraph1.Description4")}
                {enteroFaecium}
                {t("Methods.Amrs.Paragraph1.Description5")}
                {staphy}
                {t("Methods.Amrs.Paragraph1.Description6")}
            </Typography>
            <Typography component="p" sx={{ paddingBottom: "1em" }}>
                {t("Methods.Amrs.Paragraph2.Description1")}
                {salmSpp}
                {t("Methods.Amrs.Paragraph2.Description2")}
                {coliShort}
                {t("Methods.Amrs.Paragraph2.Description3")}
                {enteroSpp}
                {t("Methods.Amrs.Paragraph2.Description4")}
                {campySpp}
                {t("Methods.Amrs.Paragraph2.Description5")}
            </Typography>
            <Typography component="p" sx={{ paddingBottom: "1em" }}>
                {t("Methods.Amrs.Paragraph3.Description1")}
                {salmSpp}
                {t("Methods.Amrs.Paragraph3.Description2")}
                {campySpp}
                {t("Methods.Amrs.Paragraph3.Description3")}
            </Typography>
            <Typography component="p" sx={{ paddingBottom: "1em" }}>
                {t("Methods.Amrs.Paragraph4.Description1")}
                {coliShort}
                {t("Methods.Amrs.Paragraph4.Description2")}
            </Typography>
            <Typography component="p" sx={{ paddingBottom: "1em" }}>
                {t("Methods.Amrs.Paragraph5")}
            </Typography>
            <Typography component="p" sx={{ paddingBottom: "1em" }}>
                {t("Methods.Amrs.Paragraph6.Description1")}
                {enteroSpp}
                {t("Methods.Amrs.Paragraph6.Description2")}
                {staphy}
                {t("Methods.Amrs.Paragraph6.Description3")}
                {salm}, {campy}
                {t("Methods.Amrs.Paragraph6.Description4")}
                {coliFull}
                {t("Methods.Amrs.Paragraph6.Description5")}
                {enteroSpp}
                {t("Methods.Amrs.Paragraph6.Description6")}
            </Typography>
            <Typography component="p" sx={{ paddingBottom: "1em" }}>
                <b>
                    {t("Methods.Amrs.Paragraph7.Description1")}
                    <u>{t("Methods.Amrs.Paragraph7.Description2")}</u>
                    {t("Methods.Amrs.Paragraph7.Description3")}
                </b>
            </Typography>
            <Divider
                variant="middle"
                sx={{
                    background: theme.palette.primary.main,
                    width: "50%",
                    margin: "1em auto",
                }}
            />
            <Typography component="p" sx={{ paddingBottom: "1em" }}>
                {t("Methods.Amrs.Paragraph8.Description1")}
                {coliFull}
                {t("Methods.Amrs.Paragraph8.Description2")}
            </Typography>
            {props.amrKeys.map((amrKey) => (
                <div key={`${amrKey}-amr-table-dialog`}>
                    <Typography component="p">
                        {props.tableData[amrKey].introduction}
                    </Typography>
                    <Button
                        onClick={() => handleOpen(amrKey)}
                        sx={{
                            color: theme.palette.primary.main,
                            textAlign: "left",
                            backgroundColor: "#f3f7fa",
                            "&:hover": {
                                backgroundColor: "#dae9f5",
                                textDecoration: "underline",
                            },
                        }}
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
