import React, { useContext, useEffect, useState } from "react";
import { Dialog } from "@material-ui/core";
import _ from "lodash";
import { DataContext } from "../../../Shared/Context/DataContext";
import { FilterContext } from "../../../Shared/Context/FilterContext";
import { TableContext } from "../../../Shared/Context/TableContext";
import { DbCollection, DbKey } from "../../../Shared/Model/Client_Isolate.model";
import {
    defaultExport,
    ExportInterface,
} from "../../../Shared/Model/Export.model";
import { HeaderExportButtonComponent } from "./Header-ExportButton.component";
import { ExportCheckboxesComponent } from "./Export-Checkboxes.component";
import { ExportTextContentComponent } from "./Export-TextContent.component";
import { ExportActionButtonsComponent } from "./Export-ActionButtons.component";
import {
    ExportLabels,
    generateExportLabels,
} from "../../../Core/ExportServices/generateExportLabels.service";
import { ExportButtonLabelComponent } from "./Export-ButtonLabel.component";

export function HeaderExportComponent(): JSX.Element {
    const [open, setOpen] = useState(false);
    const [setting, setSetting] = useState<ExportInterface>(defaultExport);
    const { data } = useContext(DataContext);
    const { filter } = useContext(FilterContext);
    const { table } = useContext(TableContext);

    const chooseData = (raw: boolean, stat: boolean): void => {
        const rawData: DbCollection = raw ? data.ZNDataFiltered : [];
        const rawKeys: DbKey[] = raw ? data.keyValues : [];
        let statData: Record<string, string>[] = [];
        let statKeys: string[] = [];
        if (stat) {
            if (table.option === "absolute") {
                statData = table.statisticDataAbsolute;
            }
            if (table.option === "percent") {
                statData = table.statisticDataPercent;
            }
        }
        if (!_.isEmpty(statData)) {
            statKeys = Object.keys(statData[0]);
        }

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
    }, [table.statisticDataAbsolute, setting.raw, setting.stat]);

    const handleClickOpen = (): void => {
        setOpen(true);
    };

    const handleClose = (): void => {
        setOpen(false);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setSetting({ ...setting, [event.target.name]: event.target.checked });
    };

    const buttonLabel: JSX.Element = ExportButtonLabelComponent(open);

    const exportLabels: ExportLabels = generateExportLabels(filter.mainFilter);

    return (
        <div>
            <HeaderExportButtonComponent
                onClick={handleClickOpen}
                buttonLabel={buttonLabel}
            />
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
            >
                <ExportTextContentComponent />
                <ExportCheckboxesComponent
                    onChange={handleChange}
                    raw={setting.raw}
                    stat={setting.stat}
                />
                <ExportActionButtonsComponent
                    onClick={handleClose}
                    setting={setting}
                    filter={filter.selectedFilter}
                    mainFilterAttributes={filter.mainFilter}
                    buttonLabel={buttonLabel}
                    ZNFilename={exportLabels.ZNFilename}
                    mainFilterLabels={exportLabels.mainFilterLabels}
                    allFilterLabel={exportLabels.allFilterLabel}
                />
            </Dialog>
        </div>
    );
}
