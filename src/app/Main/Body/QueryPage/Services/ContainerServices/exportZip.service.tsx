import { TFunction } from "i18next";
import _ from "lodash";
import {
    ApiResponse,
    callApiService,
} from "../../../../../Core/callApi.service";
import { getCurrentDate } from "../../../../../Core/getCurrentDate.service";
import { adaptIsolatesFromAPI } from "../../../../../Shared/adaptIsolatesFromAPI.service";
import { IsolateDTO } from "../../../../../Shared/Model/Api_Isolate.model";
import {
    DbCollection,
    DbKey,
    MainFilterList,
} from "../../../../../Shared/Model/Client_Isolate.model";
import { ISOLATE_URL } from "../../../../../Shared/URLs";
import { DataInterface } from "../../../../../Shared/Context/DataContext";
import { FilterContextInterface } from "../../../../../Shared/Context/FilterContext";
import { dataAndStatisticToZipFile } from "../ExportServices/dataAndStatisticToZipFile.service";
import { generateExportLabels } from "../ExportServices/generateExportLabels.service";

export async function exportZipService(props: {
    t: TFunction;
    filter: FilterContextInterface;
    data: DataInterface;
    exportOptions: {
        raw: boolean;
        stat: boolean;
        chart: boolean;
    };
    urlParams: URLSearchParams;
    getPngDownloadUriRef: React.MutableRefObject<
        (() => Promise<string>) | null
    >;
}): Promise<number> {
    let rawData: DbCollection = [];
    let rawKeys: DbKey[] = [];
    let statData: Record<string, string>[] = [];
    let statKeys: string[] = [];
    let status = 200;

    const { t } = props;
    const { data } = props;

    const ZNFilename = `ZooNotify_${getCurrentDate()}.csv`;

    const exportLabels = generateExportLabels(props.filter.mainFilter, t);
    const subFileNames = {
        raw: t("Export:FileName.DataSet"),
        stat: t("Export:FileName.Stat"),
    };

    const tableAttributeNames: {
        row: string | undefined;
        column: string | undefined;
    } = {
        row: undefined,
        column: undefined,
    };

    if (!_.isEmpty(data.row)) {
        tableAttributeNames.row = t(`QueryPage:Filters.${data.row}`);
    } else {
        tableAttributeNames.row = undefined;
    }
    if (!_.isEmpty(data.column)) {
        tableAttributeNames.column = t(`QueryPage:Filters.${data.column}`);
    } else {
        tableAttributeNames.column = undefined;
    }

    if (props.exportOptions.stat) {
        if (data.option === "absolute") {
            statData = data.statisticDataAbsolute;
        }
        if (data.option === "relative") {
            statData = data.statisticDataRelative;
        }
        if (!_.isEmpty(statData)) {
            statKeys = Object.keys(statData[0]);
        }
    }

    if (props.exportOptions.raw) {
        const { urlParams } = props;
        urlParams.delete("row");
        urlParams.delete("column");
        const urlParamsString = urlParams.toString();
        const isolateFilteredUrl = `${ISOLATE_URL}?${urlParamsString}`;
        const isolateFilteredResponse: ApiResponse<IsolateDTO> =
            await callApiService(isolateFilteredUrl);
        const isolateFilteredStatus = isolateFilteredResponse.status;
        status = isolateFilteredStatus;
        if (
            isolateFilteredStatus === 200 &&
            isolateFilteredResponse.data !== undefined
        ) {
            const isolateFilteredProp: IsolateDTO =
                isolateFilteredResponse.data;
            const adaptedFilteredIsolates: DbCollection =
                adaptIsolatesFromAPI(isolateFilteredProp);
            rawData = adaptedFilteredIsolates;
            rawKeys = MainFilterList;
        }
    }

    let chartImgUri: string | undefined;
    const znPngFilename = `ZooNotify_${t(
        "Export:FileName.Chart"
    )}_${getCurrentDate()}.png`;

    if (props.exportOptions.chart) {
        if (props.getPngDownloadUriRef.current !== null) {
            chartImgUri = await props.getPngDownloadUriRef.current();
        }
    }

    if (status === 200) {
        dataAndStatisticToZipFile({
            exportOptions: props.exportOptions,
            tableAttributeNames,
            rawDataSet: {
                rawData,
                rawKeys,
            },
            statDataSet: {
                statData,
                statKeys,
            },
            imgData: chartImgUri,
            ZNFilename,
            znPngFilename,
            filter: props.filter.selectedFilter,
            allFilterLabel: exportLabels.allFilterLabel,
            mainFilterLabels: exportLabels.mainFilterLabels,
            mainFilterAttributes: props.filter.mainFilter,
            subFileNames,
        });
    }

    return status;
}
