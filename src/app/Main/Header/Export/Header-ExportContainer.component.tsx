import React, { useCallback, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import { HeaderExportDialogComponent } from "./Dialog/Header-ExportDialog.component";
import { generateExportLabels } from "./ExportServices/generateExportLabels.service";
import { ApiResponse, callApiService } from "../../../Core/callApi.service";
import { HeaderExportButtonComponent } from "./Header-ExportButton.component";
import { ExportButtonLabelComponent } from "../../../Shared/Export-ButtonLabel.component";
import { dataOrStatisticToCsvString } from "./ExportServices/dataOrStatisticToCsvString.service";
import { dataAndStatisticToZipFile } from "./ExportServices/dataAndStatisticToZipFile.service";

export function HeaderExportContainerComponent(): JSX.Element {
    const [setting, setSetting] = useState<ExportInterface>(defaultExport);
    const [isOpen, setIsOpen] = useState(false);
    const [isExport, setIsExport] = useState(false);
    const [csvDataString, setCsvDataString] = useState<string>();
    const [loading, setLoading] = useState(false);
    const { table } = useContext(TableContext);
    const { filter } = useContext(FilterContext);
    const history = useHistory();
    const { t } = useTranslation(["Export"]);

    const exportLabels = generateExportLabels(filter.mainFilter);
    const subFileNames = [t("FileName.Stat"), t("FileName.DataSet")];
    const subFileName =
        setting.raw && !setting.stat
            ? subFileNames[1]
            : (!setting.raw && setting.stat
            ? subFileNames[0]
            : "");
    const ZNFilename = `${subFileName}_${exportLabels.ZNFilename}`;

    const isolateFilteredUrl: string = ISOLATE_URL + history.location.search;

    const buttonLabel: JSX.Element = ExportButtonLabelComponent(isOpen);
  
    const fetchAndChooseData = async (
        raw: boolean,
        stat: boolean
    ): Promise<void> => {
        setLoading(true);
        let rawData: DbCollection = [];
        let rawKeys: DbKey[] = [];
        let statData: Record<string, string>[] = [];
        let statKeys: string[] = [];

        if (stat) {
            if (table.option === "absolute") {
                statData = table.statisticDataAbsolute;
            }
            if (table.option === "relative") {
                statData = table.statisticDataRelative;
            }
            if (!_.isEmpty(statData)) {
                statKeys = Object.keys(statData[0]);
            }
        }

        if (raw) {
            const isolateFilteredResponse: ApiResponse<IsolateDTO> = await callApiService(
                isolateFilteredUrl
            );
            const isolateFilteredStatus = isolateFilteredResponse.status;
            if (
                isolateFilteredStatus === 200 &&
                isolateFilteredResponse.data !== undefined
            ) {
                const isolateFilteredProp: IsolateDTO =
                    isolateFilteredResponse.data;
                const adaptedFilteredIsolates: DbCollection = adaptIsolatesFromAPI(
                    isolateFilteredProp
                );
                rawData = adaptedFilteredIsolates;
                rawKeys = DbKeyCollection;
            }
        }

        const newSettings = {
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
        };

        if ((!raw && stat) || (raw && !stat)) {
            const dataString: string = dataOrStatisticToCsvString({
                setting: newSettings,
                filter: filter.selectedFilter,
                allFilterLabel: exportLabels.allFilterLabel,
                mainFilterLabels: exportLabels.mainFilterLabels,
                mainFilterAttributes: filter.mainFilter,
            });
            setCsvDataString(dataString)
        }

        if (raw && stat) {
            dataAndStatisticToZipFile({
                setting: newSettings,
                ZNFilename,
                filter: filter.selectedFilter,
                allFilterLabel: exportLabels.allFilterLabel,
                mainFilterLabels: exportLabels.mainFilterLabels,
                mainFilterAttributes: filter.mainFilter,
                subFileNames,
            });
            setIsOpen(false);
        }
        setSetting(newSettings);
        setLoading(false);
    };    

    useEffect(() => {
        if (isExport) {
            fetchAndChooseData(setting.raw, setting.stat);
        }
    }, [isExport]);

    const handleChange = (name: string, checked: boolean): void => {
        setSetting({ ...setting, [name]: checked });
    };

    const handleClickOpen = (): void => {
        setIsOpen(true);
    };
    const handleClose = (): void => {
        // eslint-disable-next-line unicorn/no-useless-undefined
        setCsvDataString(undefined);
        setIsExport(false);
        setIsOpen(false);
    };
    const handleExport = (): void => {
        setIsExport(true);
    };

    const reset = useCallback(() => {
        // eslint-disable-next-line unicorn/no-useless-undefined
        setCsvDataString(undefined);
        setIsExport(false);
        setIsOpen(false);
  }, [isExport, isOpen, csvDataString])


    return (
        <div>
            <HeaderExportButtonComponent
                onClickOpen={handleClickOpen}
                buttonLabel={buttonLabel}
            />
            {isOpen && (
                <HeaderExportDialogComponent
                    raw={setting.raw}
                    stat={setting.stat}
                    ZNFilename={ZNFilename}
                    dataString={csvDataString}
                    buttonLabel={buttonLabel}
                    loading={loading}
                    onClickClose={handleClose}
                    onClickExport={handleExport}
                    onCheckboxChange={handleChange}
                    clearData={reset}
                />
            )}
        </div>
    );
}
