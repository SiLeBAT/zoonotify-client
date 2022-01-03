import React, { useState } from "react";
import { Button, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AmrKey, AmrsTable, microorganismNames } from "../InfoPage.model";
import { InfoPageAmrDialogComponent } from "./InfoPage-AmrsDialog.component";
import { primaryColor } from "../../../../Shared/Style/Style-MainTheme";

export function InfoPageAmrsContentComponent(props: {
    amrKeys: AmrKey[];
    tableData: Record<AmrKey, AmrsTable>;
    onAmrDataExport: (amrKey: AmrKey) => void;
}): JSX.Element {
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
            <p>
                {t("Methods.Amrs.Paragraph1.Description1")}
                {microorganismNames.SalmSpp}, {microorganismNames.CampyJeC},{" "}
                {microorganismNames.CampyColiC}, {microorganismNames.CampyLari},{" "}
                {microorganismNames.ColiFullE},
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
                {microorganismNames.SalmSpp}
                {t("Methods.Amrs.Paragraph2.Description2")}
                {microorganismNames.ColiShort}
                {t("Methods.Amrs.Paragraph2.Description3")}
                {microorganismNames.CampySpp}
                {t("Methods.Amrs.Paragraph2.Description4")}
            </p>
            <p>
                {t("Methods.Amrs.Paragraph3.Description1")}
                {microorganismNames.SalmSpp}
                {t("Methods.Amrs.Paragraph3.Description2")}
                {microorganismNames.CampySpp}
                {t("Methods.Amrs.Paragraph3.Description3")}
            </p>
            <p>
                {t("Methods.Amrs.Paragraph4.Description1")}
                {microorganismNames.ColiShort}
                {t("Methods.Amrs.Paragraph4.Description2")}
            </p>
            <p>{t("Methods.Amrs.Paragraph5")}</p>
            <p>
                {t("Methods.Amrs.Paragraph6.Description1")}
                {microorganismNames.EnteroSpp}
                {t("Methods.Amrs.Paragraph6.Description2")}
                {microorganismNames.Staphy}
                {t("Methods.Amrs.Paragraph6.Description3")}
                {microorganismNames.Salm}, {microorganismNames.Campy}
                {t("Methods.Amrs.Paragraph6.Description4")}
                {microorganismNames.ColiFull}
                {t("Methods.Amrs.Paragraph6.Description5")}
                {microorganismNames.EnteroSpp}
                {t("Methods.Amrs.Paragraph6.Description6")}
            </p>
            <p>
                <b>
                    {t("Methods.Amrs.Paragraph7.Description1")}
                    <u>{t("Methods.Amrs.Paragraph7.Description2")}</u>
                    {t("Methods.Amrs.Paragraph7.Description3")}
                </b>
            </p>
            <Divider
                variant="middle"
                sx={{
                    background: primaryColor,
                    width: "50%",
                    margin: "auto",
                }}
            />
            <p>
                {t("Methods.Amrs.Paragraph8.Description1")}
                {microorganismNames.ColiFull}
                {t("Methods.Amrs.Paragraph8.Description2")}
            </p>
            {props.amrKeys.map((amrKey) => (
                <div key={`${amrKey}-amr-table-dialog`}>
                    {props.tableData[amrKey].introduction}
                    <Button
                        onClick={() => handleOpen(amrKey)}
                        color="primary"
                        sx={{
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
