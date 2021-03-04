import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import _ from "lodash";
import {
    ExportLabels,
    generateExportLabels,
} from "../../../Core/ExportServices/generateExportLabels.service";
import { adaptIsolatesFromAPI } from "../../../Core/adaptIsolatesFromAPI.service";
import { ISOLATE_URL } from "../../../Shared/URLs";
import { IsolateDTO } from "../../../Shared/Model/Api_Isolate.model";
import { FilterContext } from "../../../Shared/Context/FilterContext";
import { DataContext } from "../../../Shared/Context/DataContext";
import { TableContext } from "../../../Shared/Context/TableContext";
import {
    DbCollection,
    DbKey,
} from "../../../Shared/Model/Client_Isolate.model";
import {
    defaultExport,
    ExportInterface,
} from "../../../Shared/Model/Export.model";
import { HeaderExportComponent } from "./Header-Export.component";
import { ExportButtonLabelComponent } from "./Export-ButtonLabel.component";

export function HeaderExportContainerComponent(): JSX.Element {
    const [setting, setSetting] = useState<ExportInterface>(defaultExport);
    const [isOpen, setIsOpen] = useState(false);
    const { data } = useContext(DataContext);
    const { table } = useContext(TableContext);
    const { filter } = useContext(FilterContext);
    const history = useHistory();

    const ISOLATE_FILTERED_URL: string = ISOLATE_URL + history.location.search;

    const fetchAndChooseData = async (
        raw: boolean,
        stat: boolean
    ): Promise<void> => {
        const isolateFilteredResponse: Response = await fetch(
            ISOLATE_FILTERED_URL
        );

        const isolateFilteredStatus = isolateFilteredResponse.status;

        let rawData: DbCollection = [];
        let rawKeys: DbKey[] = [];
        let statData: Record<string, string>[] = [];
        let statKeys: string[] = [];

        if (isolateFilteredStatus === 200) {
            const isolateFilteredProp: IsolateDTO = await isolateFilteredResponse.json();
            const adaptedFilteredIsolates: DbCollection = adaptIsolatesFromAPI(
                isolateFilteredProp
            );
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
            if (raw) {
                rawData = adaptedFilteredIsolates;
                rawKeys = data.keyValues;
            }
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
        fetchAndChooseData(setting.raw, setting.stat);
    }, [
        table.statisticDataAbsolute,
        setting.raw,
        setting.stat,
        ISOLATE_FILTERED_URL,
    ]);

    const handleChange = (name: string, checked: boolean): void => {
        setSetting({ ...setting, [name]: checked });
    };

    const handleClickOpen = (): void => {
        setIsOpen(true);
    };
    const handleClickClose = (): void => {
        setIsOpen(false);
    };

    const buttonLabel: JSX.Element = ExportButtonLabelComponent(isOpen);
    const exportLabels: ExportLabels = generateExportLabels(filter.mainFilter);

    return (
        <HeaderExportComponent
            isOpen={isOpen}
            settings={setting}
            buttonLabel={buttonLabel}
            exportLabels={exportLabels}
            handleClickOpen={handleClickOpen}
            handleClickClose={handleClickClose}
            handleCheckbox={handleChange}
        />
    );
}
