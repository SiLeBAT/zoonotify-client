import { TFunction } from "i18next";
import { ClientIsolateCountedGroups } from "../../../../../Shared/Model/Client_Isolate.model";
import { adaptCountedIsolatesGroupsService } from "../adaptCountedIsolatesGroups.service";
import {
    calculateRelativeChartData,
    calculateRelativeTableData,
} from "../TableServices/calculateRelativeTableData.service";
import {
    calculateRowColSumsAbsolute,
    calculateRowColSumsRelative,
} from "../TableServices/calculateRowColSums.service";
import { generateStatisticTableDataAbsService } from "../TableServices/generateStatisticTableDataAbs.service";
import { generateTableHeaderValuesService } from "../TableServices/generateTableHeaderValues.service";
import { FilterInterface } from "../../../../../Shared/Model/Filter.model";

export function generateDataObjectsService(props: {
    t: TFunction;
    isolateCountGroups: (Record<string, string | Date> & {
        count: number;
    })[];
    nrOfSelectedIsolates: number;
    uniqueValues: FilterInterface;
    isCol: boolean;
    isRow: boolean;
    selectedFilters: FilterInterface;
    colAttribute: string;
    rowAttribute: string;
}): {
    colNames: string[];
    statisticDataAbsolute: Record<string, string>[];
    statisticDataRelative: Record<string, string>[];
    statisticDataRelativeChart: Record<string, string>[];
    statTableDataWithSumsAbs: Record<string, string>[];
    statTableDataWithSumsRel: Record<string, string>[];
} {
    const { t } = props;

    const adaptedIsolateCountGroups: ClientIsolateCountedGroups =
        adaptCountedIsolatesGroupsService(props.isolateCountGroups);

    const allValuesText = t("QueryPage:Results.NrIsolatesText");

    const columnNames = generateTableHeaderValuesService(
        props.isCol,
        allValuesText,
        props.uniqueValues.filters,
        props.selectedFilters.filters,
        props.colAttribute
    );
    const rowNameValues = generateTableHeaderValuesService(
        props.isRow,
        allValuesText,
        props.uniqueValues.filters,
        props.selectedFilters.filters,
        props.rowAttribute
    );
    const statisticTableDataAbs: Record<string, string>[] =
        generateStatisticTableDataAbsService(
            allValuesText,
            adaptedIsolateCountGroups,
            columnNames,
            rowNameValues,
            props.colAttribute,
            props.rowAttribute
        );

    const statisticTableDataRel = calculateRelativeTableData(
        statisticTableDataAbs,
        props.nrOfSelectedIsolates
    );

    const statTableDataWithSumsAbs = calculateRowColSumsAbsolute(
        statisticTableDataAbs,
        columnNames,
        props.nrOfSelectedIsolates.toString()
    );
    const statTableDataWithSumsRel = calculateRowColSumsRelative(
        statisticTableDataRel,
        columnNames,
        props.nrOfSelectedIsolates.toString(),
        statTableDataWithSumsAbs
    );

    const statisticChartDataRel = calculateRelativeChartData(
        statTableDataWithSumsAbs
    );

    return {
        colNames: columnNames,
        statisticDataAbsolute: statisticTableDataAbs,
        statisticDataRelative: statisticTableDataRel,
        statisticDataRelativeChart: statisticChartDataRel,
        statTableDataWithSumsAbs,
        statTableDataWithSumsRel,
    };
}
