import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import _ from "lodash";
import { ISOLATE_URL } from "../../../Shared/URLs";
import { IsolateDTO } from "../../../Shared/Model/Api_Isolate.model";
import { FilterContext } from "../../../Shared/Context/FilterContext";
import { TableContext } from "../../../Shared/Context/TableContext";
import {
    DbCollection,
    DbKey,
    DbKeyCollection,
} from "../../../Shared/Model/Client_Isolate.model";
import {
    defaultExport,
    ExportInterface,
} from "../../../Shared/Model/Export.model";
import { adaptIsolatesFromAPI } from "../../../Shared/adaptIsolatesFromAPI.service";
import { HeaderExportComponent } from "./Header-Export.component";
import { generateExportLabels } from "./ExportServices/generateExportLabels.service";

export function HeaderExportContainerComponent(): JSX.Element {
    const [setting, setSetting] = useState<ExportInterface>(defaultExport);
    const [isOpen, setIsOpen] = useState(false);
    const { table } = useContext(TableContext);
    const { filter } = useContext(FilterContext);
    const history = useHistory();

    const isolateFilteredUrl: string = ISOLATE_URL + history.location.search;

    const fetchAndChooseData = async (
        raw: boolean,
        stat: boolean
    ): Promise<void> => {
        const isolateFilteredResponse: Response = await fetch(
            isolateFilteredUrl
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
                if (table.option === "relative") {
                    statData = table.statisticDataRelative;
                }
            }
            if (!_.isEmpty(statData)) {
                statKeys = Object.keys(statData[0]);
            }
            if (raw) {
                rawData = adaptedFilteredIsolates;
                rawKeys = DbKeyCollection;
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
        isolateFilteredUrl,
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

    const exportLabels = generateExportLabels(filter.mainFilter);

    return (
        <HeaderExportComponent
            isOpen={isOpen}
            settings={setting}
            exportLabels={exportLabels}
            filter={filter}
            onClickOpen={handleClickOpen}
            onClickClose={handleClickClose}
            onCheckboxChange={handleChange}
        />
    );
}
