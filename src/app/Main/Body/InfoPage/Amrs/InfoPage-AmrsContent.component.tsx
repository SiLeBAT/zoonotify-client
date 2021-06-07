import React, { useState } from "react";
import { Button, createStyles, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { AmrKey, AmrsTable } from "../InfoPage.model";
import { InfoPageAmrDialogComponent } from "./InfoPage-AmrsDialog.component";


const useStyles = makeStyles(() =>
  createStyles({
      button: {
        textAlign: "left",
        backgroundColor: "#f3f7fa",
        '&:hover': {
          backgroundColor: "#dae9f5",
          textDecoration: "underline",
        },
      }

  }),
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
            <p>{t("Methods.Amrs.Description")}</p>
            <p>{t("Methods.Amrs.Paragraph")}</p>
            {props.amrKeys.map((amrKey) => (
                <div key={`${amrKey}-amr-table-dialog`}>
                    <p>{t(`Methods.Amrs.${amrKey}.Paragraph`)}</p>
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
