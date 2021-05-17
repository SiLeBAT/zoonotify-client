/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useState } from "react";
import { Button } from "@material-ui/core";
/* import _ from "lodash"; */
import { useTranslation } from "react-i18next";
import { AmrKey, AmrsTable } from "../InfoPage.model";
import { InfoPageAmrDialogComponent } from "./InfoPage-AmrsDialog.component";

const tableDialogButtonStyle = css`
    text-align: left;
`;

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
            <p>{t("Methods.Amrs.Description")}</p>
            <p>{t("Methods.Amrs.Paragraph")}</p>
            {props.amrKeys.map((amrKey) => (
                <div key={`${amrKey}-amr-table-dialog`}>
                    <p>{t(`Methods.Amrs.${amrKey}.Paragraph`)}</p>
                    <Button
                        css={tableDialogButtonStyle}
                        onClick={() => handleOpen(amrKey)}
                        color="primary"
                    >
                        {props.tableData[amrKey].title}
                    </Button>
                    <InfoPageAmrDialogComponent
                        resistancesTableData={props.tableData[amrKey]}
                        amrKey={amrKey}
                        openAmrDialogKey={openAmrDialog}
                        onClose={handleClose}
                        onAmrDataExport={() => handleExportAmrData(amrKey)}
                    />
                </div>
            ))}
        </div>
    );
}
