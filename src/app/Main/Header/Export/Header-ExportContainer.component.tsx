/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useContext, useEffect, useState } from "react";
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
import { HeaderExportDialogComponent } from "./Dialog/Header-ExportDialog.component";
import { generateExportLabels } from "./ExportServices/generateExportLabels.service";
import { ApiResponse, callApiService } from "../../../Core/callApi.service";
import { HeaderExportButtonComponent } from "./Header-ExportButton.component";
import { ExportButtonLabelComponent } from "../../../Shared/Export-ButtonLabel.component";
import { bfrPrimaryPalette } from "../../../Shared/Style/Style-MainTheme.component";

const subheaderStyle = css`
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    background-color: ${bfrPrimaryPalette[300]};
    box-sizing: border-box;
    box-shadow: 0 8px 6px -6px grey;
`;

export function HeaderExportContainerComponent(): JSX.Element {
    const [setting, setSetting] = useState<ExportInterface>(defaultExport);
    const [isOpen, setIsOpen] = useState(false);
    const [isExport, setIsExport] = useState(false);
    const { table } = useContext(TableContext);
    const { filter } = useContext(FilterContext);
    const history = useHistory();

    const isolateFilteredUrl: string = ISOLATE_URL + history.location.search;

    const fetchAndChooseData = async (
        raw: boolean,
        stat: boolean
    ): Promise<void> => {
        const isolateFilteredResponse: ApiResponse<IsolateDTO> = await callApiService(
            isolateFilteredUrl
        );

        const isolateFilteredStatus = isolateFilteredResponse.status;

        let rawData: DbCollection = [];
        let rawKeys: DbKey[] = [];
        let statData: Record<string, string>[] = [];
        let statKeys: string[] = [];

        if (
            isolateFilteredStatus === 200 &&
            isolateFilteredResponse.data !== undefined
        ) {
            const isolateFilteredProp: IsolateDTO =
                isolateFilteredResponse.data;
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
        setIsOpen(false);
    };
    const handleExport = (): void => {
        setIsOpen(false);
        setIsExport(true);
    };

    const exportLabels = generateExportLabels(filter.mainFilter);
    const buttonLabel: JSX.Element = ExportButtonLabelComponent(isOpen);


    return (
        <div css={subheaderStyle}>
            <HeaderExportButtonComponent
                onClickOpen={handleClickOpen}
                buttonLabel={buttonLabel}
            />
            {isOpen && (
                <HeaderExportDialogComponent
                    settings={setting}
                    exportLabels={exportLabels}
                    buttonLabel={buttonLabel}
                    filter={filter}
                    onClickClose={handleClose}
                    onClickExport={handleExport}
                    onCheckboxChange={handleChange}
                />
            )}
        </div>
    );
}
