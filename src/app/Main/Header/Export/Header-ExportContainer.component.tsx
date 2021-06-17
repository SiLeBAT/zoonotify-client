import React, { useContext, useState } from "react";
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
import { adaptIsolatesFromAPI } from "../../../Shared/adaptIsolatesFromAPI.service";
import { HeaderExportDialogComponent } from "./Dialog/Header-ExportDialog.component";
import { generateExportLabels } from "./ExportServices/generateExportLabels.service";
import { ApiResponse, callApiService } from "../../../Core/callApi.service";
import { HeaderExportButtonComponent } from "./Header-ExportButton.component";
import { ExportButtonLabelComponent } from "../../../Shared/Export-ButtonLabel.component";
import { dataAndStatisticToZipFile } from "./ExportServices/dataAndStatisticToZipFile.service";

export function HeaderExportContainerComponent(): JSX.Element {
    const { table } = useContext(TableContext);
    const { t } = useTranslation(["Export", "QueryPage"]);
    const { filter } = useContext(FilterContext);
    const [setting, setSetting] = useState<{
        raw: boolean;
        stat: boolean;
        tableAttributeNames: {
            row: string | undefined;
            column: string | undefined;
        };
    }>({
        raw: true,
        stat: true,
        tableAttributeNames: {
            row: undefined,
            column: undefined,
        },
    });
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    const exportLabels = generateExportLabels(filter.mainFilter);
    const subFileNames = {
        raw: t("Export:FileName.DataSet"),
        stat: t("Export:FileName.Stat"),
    };

    if (!_.isEmpty(table.row)) {
        setting.tableAttributeNames.row = t(`QueryPage:Filters.${table.row}`);
    } else {
        setting.tableAttributeNames.row = undefined;
    }
    if (!_.isEmpty(table.column)) {
        setting.tableAttributeNames.column = t(
            `QueryPage:Filters.${table.column}`
        );
    } else {
        setting.tableAttributeNames.column = undefined
    }

    const isolateFilteredUrl: string = ISOLATE_URL + history.location.search;

    const buttonLabel: JSX.Element = ExportButtonLabelComponent(isOpen);

    const fetchAndChooseData = async (): Promise<void> => {
        setLoading(true);
        let rawData: DbCollection = [];
        let rawKeys: DbKey[] = [];
        let statData: Record<string, string>[] = [];
        let statKeys: string[] = [];

        if (setting.stat) {
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

        if (setting.raw) {
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

        dataAndStatisticToZipFile({
            setting,
            rawDataSet: {
                rawData,
                rawKeys,
            },
            statDataSet: {
                statData,
                statKeys,
            },
            ZNFilename: exportLabels.ZNFilename,
            filter: filter.selectedFilter,
            allFilterLabel: exportLabels.allFilterLabel,
            mainFilterLabels: exportLabels.mainFilterLabels,
            mainFilterAttributes: filter.mainFilter,
            subFileNames,
        });
        setIsOpen(false);
        setLoading(false);
    };

    const handleChange = (name: string, checked: boolean): void => {
        setSetting({ ...setting, [name]: checked });
    };
    const handleClickOpen = (): void => {
        setIsOpen(true);
    };
    const handleClose = (): void => {
        setIsOpen(false);
    };
    const handleExport = async (): Promise<void> => {
        fetchAndChooseData();
    };

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
                    buttonLabel={buttonLabel}
                    loading={loading}
                    onClickClose={handleClose}
                    onClickExport={handleExport}
                    onCheckboxChange={handleChange}
                />
            )}
        </div>
    );
}
