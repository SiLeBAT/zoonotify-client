import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import _ from "lodash";
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
import { adaptIsolatesFromAPI } from "../../../Core/adaptIsolatesFromAPI.service";
import { isolateURL } from "../../../Shared/URLs";
import { IsolateDTO } from "../../../Shared/Model/Api_Isolate.model";
import { HeaderExportComponent } from "./Header-Export.component";

export function HeaderExportContainerComponent(): JSX.Element {
    const [setting, setSetting] = useState<ExportInterface>(defaultExport);
    const { data } = useContext(DataContext);
    const { table } = useContext(TableContext);
    const history = useHistory();
    
    const ISOLATE_FILTERED_URL: string = isolateURL + history.location.search;

    const fetchAndChooseData = async (
        raw: boolean,
        stat: boolean
    ): Promise<void> => {
        const isolateFilteredResponse: Response = await fetch(
            ISOLATE_FILTERED_URL
        );
        const isolateFilteredProp: IsolateDTO = await isolateFilteredResponse.json();
        const adaptedFilteredIsolates: DbCollection = adaptIsolatesFromAPI(
            isolateFilteredProp
        );

        const rawData: DbCollection = raw ? adaptedFilteredIsolates : [];
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
        fetchAndChooseData(setting.raw, setting.stat);
    }, [
        table.statisticDataAbsolute,
        setting.raw,
        setting.stat,
        ISOLATE_FILTERED_URL,
    ]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setSetting({ ...setting, [event.target.name]: event.target.checked });
    };

    return (
        <HeaderExportComponent settings={setting} handleChange={handleChange} />
    );
}
