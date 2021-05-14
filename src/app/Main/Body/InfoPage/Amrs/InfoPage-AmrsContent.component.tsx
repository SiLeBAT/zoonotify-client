/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useState } from "react";
import { Button } from "@material-ui/core";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { AmrKey, AmrsTable } from "../InfoPage.model";
import { InfoPageAmrDialogComponent } from "./InfoPage-AmrsDialog.component";

const tableDialogButtonStyle = css`
    text-align: left
`

export function InfoPageAmrsContentComponent(props: {
    amrKeys: AmrKey[];
    tableData: Record<AmrKey, AmrsTable>;
    onAmrDataExport: (amrKey: AmrKey) => void;
}): JSX.Element {
    const { t } = useTranslation(["InfoPage"]);

    const [
        infoPageTableDialogsAreOpen,
        setInfoPageTableDialogsAreOpen,
    ] = useState<Record<AmrKey, boolean>>({
        coliSalm: false,
        coliSalmTwo: false,
        campy: false,
        mrsa: false,
        ef: false,
    });

    const handleClose = (): void => {
        const allClosed: Record<string, boolean> = _.mapValues(
            infoPageTableDialogsAreOpen,
            () => false
        );
        setInfoPageTableDialogsAreOpen(allClosed);
    };
    const handleExportAmrData = (amrKey: AmrKey): void => {
        props.onAmrDataExport(amrKey);
        const allClosed: Record<string, boolean> = _.mapValues(
            infoPageTableDialogsAreOpen,
            () => false
        );
        setInfoPageTableDialogsAreOpen(allClosed);
    };

    const handleOpen = (amrKey: AmrKey): void => {
        const newIsOpen: Record<string, boolean> = _.mapValues(
            infoPageTableDialogsAreOpen,
            () => false
        );
        newIsOpen[amrKey] = true;
        setInfoPageTableDialogsAreOpen(newIsOpen);
    };

    return (
        <div>
            <p>{t("Methods.Amrs.Description")}</p>
            <p>{t("Methods.Amrs.Paragraph")}</p>
            {props.amrKeys.map((amrKey) => (
                <div key={`${amrKey}-amr-table-dialog`}>
                    <p>{t(`Methods.Amrs.${amrKey}.Paragraph`)}</p>
                    <Button css={tableDialogButtonStyle} onClick={() => handleOpen(amrKey)} color="primary">
                        {props.tableData[amrKey].title}
                    </Button>
                    <InfoPageAmrDialogComponent
                        resistancesTableData={props.tableData[amrKey]}
                        isOpen={
                            infoPageTableDialogsAreOpen[amrKey]
                        }
                        onClose={handleClose}
                        onAmrDataExport={() => handleExportAmrData(amrKey)}
                    />
                </div>
            ))}
        </div>
    );
}
