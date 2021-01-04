import React, { useContext, useEffect, useState } from "react";
import { Dialog } from "@material-ui/core";
import _ from "lodash";
import { DataContext } from "../../../Shared/Context/DataContext";
import { FilterContext } from "../../../Shared/Context/FilterContext";
import { TableContext } from "../../../Shared/Context/TableContext";
import { DBentry, DBtype } from "../../../Shared/Model/Isolat.model";
import { defaultExport, ExportInterface } from "../../../Shared/Model/Export.model";
import { HeaderExportButtonComponent as ExportButton } from "./Header-ExportButton.component";
import { ExportCheckboxesComponent as Checkboxes } from "./Export-Checkboxes.component";
import { ExportTextContentComponent as TextContent } from "./Export-TextContent.component";
import { ExportActionButtonsComponent as ActionButtons } from "./Export-ActionButtons.component";
import { generateExportLabels } from "../../../Core/ExportServices/Export-Labels.service";

export function HeaderExportComponent(): JSX.Element {
    const [open, setOpen] = useState(false);
    const [setting, setSetting] = useState<ExportInterface>(defaultExport);
    const { data } = useContext(DataContext);
    const { filter } = useContext(FilterContext);
    const { table } = useContext(TableContext);

    const chooseData = (raw: boolean, stat: boolean): void => {
        const rawData: DBentry[] = raw ? data.ZNDataFiltered : [];
        const rawKeys: DBtype[] = raw ? data.keyValues : [];
        const statData: Record<string, string>[] = stat
            ? table.statisticData
            : [];
        const statKeys: string[] =
            stat && !_.isEmpty(table.statisticData)
                ? Object.keys(table.statisticData[0])
                : [];

        setSetting({
            ...setting,
            tableAttributes: {
                row: table.row,
                column: table.column,
            },
            rawDataSet: {
                rawData,
                rawKeys,
            },
            statDataSet: {
                statData,
                statKeys,
            },
        });
    };

    useEffect(() => {
        chooseData(setting.raw, setting.stat);
    }, [table.statisticData, setting.raw, setting.stat]);

    const handleClickOpen = (): void => {
        setOpen(true);
    };

    const handleClose = (): void => {
        setOpen(false);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setSetting({ ...setting, [event.target.name]: event.target.checked });
    };

    const [
        buttonLabel,
        ZNFilename,
        mainFilterLabels,
        allFilterLabel,
    ] = generateExportLabels(open);

    return (
        <div>
            <ExportButton
                onClick={handleClickOpen}
                buttonLabel={buttonLabel}
            />
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
            >
                <TextContent />
                <Checkboxes
                    onChange={handleChange}
                    raw={setting.raw}
                    stat={setting.stat}
                />
                <ActionButtons
                    onClick={handleClose}
                    setting={setting}
                    filter={filter}
                    buttonLabel={buttonLabel}
                    ZNFilename={ZNFilename}
                    mainFilterLabels={mainFilterLabels}
                    allFilterLabel={allFilterLabel}
                />
            </Dialog>
        </div>
    );
}
