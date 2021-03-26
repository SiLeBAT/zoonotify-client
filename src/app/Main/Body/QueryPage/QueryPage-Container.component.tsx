import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { ValueType } from "react-select";
import { DataContext } from "../../../Shared/Context/DataContext";
import {
    IsolateCountedDTO,
    IsolateDTO,
} from "../../../Shared/Model/Api_Isolate.model";
import {
    ClientIsolateCounted,
    DbCollection,
    DbKeyCollection,
} from "../../../Shared/Model/Client_Isolate.model";
import {
    FILTER_URL,
    ISOLATE_COUNT_URL,
    ISOLATE_URL,
} from "../../../Shared/URLs";
import { LoadingOrErrorComponent } from "../../../Shared/LoadingOrError.component";
import {
    defaultFilter,
    FilterContext,
    FilterContextInterface,
} from "../../../Shared/Context/FilterContext";
import {
    DisplayOptionType,
    TableContext,
    TableInterface,
    TableType,
} from "../../../Shared/Context/TableContext";
import { FilterConfigDTO } from "../../../Shared/Model/Api_Filter.model";
import {
    FilterInterface,
    FilterType,
} from "../../../Shared/Model/Filter.model";
import { getFilterFromPath } from "../../../Core/PathServices/getFilterFromPath.service"; 
import { generatePathStringService } from "../../../Core/PathServices/generatePathString.service";
import { QueryPageComponent } from "./QueryPage.component";
import { CheckIfFilterIsSet } from "../../../Core/FilterServices/checkIfFilterIsSet.service";
import { adaptIsolatesFromAPI } from "../../../Core/adaptIsolatesFromAPI.service";
import { handleChangeDisplayedFeatures } from "./ChangeDisplFeatures.service";
import { changeFilter } from "./ChangeFilter.service";
import { calculateRelativeTableData } from "./Results/calculateRelativeTableData.service";
import { adaptCountedIsolatesGroupsService } from "../../../Core/adaptCountedIsolatesGroups.service";
import { generateUniqueValuesService } from "./generateUniqueValues.service";
import { generateTableHeaderValuesService } from "./generateTableHeaderValues.service";
import { generateStatisticTableDataAbsService } from "./generateStatisticTableDataAbs.service";
import { getFeaturesFromPath } from "../../../Core/PathServices/getTableFromPath.service";

export function QueryPageContainerComponent(): JSX.Element {
    const [isolateStatus, setIsolateStatus] = useState<number>();
    const [isolateCountStatus, setIsolateCountStatus] = useState<number>();
    const [filterStatus, setFilterStatus] = useState<number>();
    const [columnAttributes, setColumnAttributes] = useState<string[]>([]);
    const [nrOfSelectedIsol, setNrOfSelectedIsol] = useState<number>(0);

    const { data, setData } = useContext(DataContext);
    const { filter, setFilter } = useContext(FilterContext);
    const { table, setTable } = useContext(TableContext);

    const history = useHistory();
    const { t } = useTranslation(["QueryPage"]);

    const isCol: boolean = table.column !== "";
    const isRow: boolean = table.row !== "";
    const isFilter: boolean = CheckIfFilterIsSet(
        filter.selectedFilter,
        filter.mainFilter
    );
    const rowAttribute: FilterType = table.row;
    const colAttribute: FilterType = table.column;

    const isolateCountUrl: string = ISOLATE_COUNT_URL + history.location.search;

    const handleChangeDisplFeatures = (
        selectedOption: ValueType<{ value: string; label: string }>,
        keyName: FilterType | TableType
    ): void => {
        const newTable: TableInterface = {
            ...table,
            [keyName]: handleChangeDisplayedFeatures(selectedOption),
        };
        const newPath: string = generatePathStringService(filter, newTable)
        history.push(newPath);
        setTable(newTable);
    };

    const handleSwapDisplFeatures = (): void => {
        const newTable: TableInterface = {
            ...table,
            row: table.column,
            column: table.row,
        };
        const newPath: string = generatePathStringService(filter, newTable)
        history.push(newPath);
        setTable(newTable);
    };

    const handleRemoveAllDisplFeatures = (): void => {
        const newTable: TableInterface = {
            ...table,
            row: "" as FilterType,
            column: "" as FilterType,
        };
        const newPath: string = generatePathStringService(filter, newTable)
        history.push(newPath);
        setTable(newTable);
    };

    const handleChangeFilter = (
        selectedOption: ValueType<{ value: string; label: string }>,
        keyName: FilterType | TableType
    ): void => {
        const newFilter: FilterContextInterface = {
            ...filter,
            selectedFilter: {
                ...filter.selectedFilter,
                [keyName]: changeFilter(selectedOption),
            },
        };
        const newPath: string = generatePathStringService(newFilter, table);
        history.push(newPath);
        setFilter(newFilter);
    };

    const handleRemoveAllFilter = (): void => {
        const newFilter: FilterContextInterface = {
            ...filter,
            selectedFilter: defaultFilter.selectedFilter,
        };
        const newPath: string = generatePathStringService(newFilter, table);
        history.push(newPath);
        setFilter(newFilter);
    };

    const handleRadioChange = (eventTargetValue: string): void => {
        const optionValue = eventTargetValue as DisplayOptionType;
        setTable({
            ...table,
            option: optionValue,
        });
    };

    const fetchAndSetData = async (): Promise<void> => {
        const isolateResponse: Response = await fetch(ISOLATE_URL);
        const filterResponse: Response = await fetch(FILTER_URL);

        const isolateStatusVar = isolateResponse.status;
        const filterStatusVar = filterResponse.status;

        setIsolateStatus(isolateStatusVar);
        setFilterStatus(filterStatusVar);

        if (isolateStatusVar === 200 && filterStatusVar === 200) {
            const isolateProp: IsolateDTO = await isolateResponse.json();
            const filterProp: FilterConfigDTO = await filterResponse.json();

            const adaptedDbIsolates: DbCollection = adaptIsolatesFromAPI(
                isolateProp
            );
            const uniqueValuesObject: FilterInterface = generateUniqueValuesService(
                filterProp
            );
            setData({
                ZNData: adaptedDbIsolates,
                uniqueValues: uniqueValuesObject,
            });
        }
    };

    const setTableFromPath = (): void => {
        const [rowFromPath, colFromPath] = getFeaturesFromPath(
            history.location.search
        );
        setTable({
            ...table,
            row: rowFromPath,
            column: colFromPath,
        });
    };

    const setFilterFromPath = (): void => {
        const filterFromPath = getFilterFromPath(
            history.location.search,
            DbKeyCollection
        );
        setFilter({
            mainFilter: DbKeyCollection,
            selectedFilter: filterFromPath,
        });
    };

    const setTableContext = (isolateCountProp: IsolateCountedDTO): void => {
        if ((!isCol && !isRow) || isolateCountProp.groups === undefined) {
            setTable({
                ...table,
                statisticDataAbsolute: [],
            });
        } else {
            const adaptedIsolateCounts: ClientIsolateCounted = {
                totalNumberOfIsolates: isolateCountProp.totalNumberOfIsolates,
                groups: adaptCountedIsolatesGroupsService(
                    isolateCountProp.groups
                ),
            };

            const allValuesText = t("Results.TableHead");

            const colValues = generateTableHeaderValuesService(
                isCol,
                allValuesText,
                data.uniqueValues,
                filter.selectedFilter,
                colAttribute
            );
            const statisticTableDataAbs: Record<
                string,
                string
            >[] = generateStatisticTableDataAbsService(
                isRow,
                data.uniqueValues,
                filter.selectedFilter,
                allValuesText,
                adaptedIsolateCounts.groups,
                colValues,
                colAttribute,
                rowAttribute
            );

            const nrOfSelectedIsolates =
                adaptedIsolateCounts.totalNumberOfIsolates;
            const statisticTableDataRel = calculateRelativeTableData(
                statisticTableDataAbs,
                nrOfSelectedIsolates
            );
            setColumnAttributes(colValues);
            setTable({
                ...table,
                statisticDataAbsolute: statisticTableDataAbs,
                statisticDataPercent: statisticTableDataRel,
            });
        }
    };

    const fetchIsolateCounted = async (): Promise<void> => {
        const isolateCountResponse: Response = await fetch(
            isolateCountUrl
        );
        setIsolateCountStatus(isolateCountResponse.status);
        if (isolateCountResponse.status === 200) {
            const isolateCountProp: IsolateCountedDTO = await isolateCountResponse.json();
            if (isolateCountProp.groups !== undefined) {
                setTableContext(isolateCountProp);
            }
            setNrOfSelectedIsol(isolateCountProp.totalNumberOfIsolates);
        }
    };

    useEffect(() => {
        fetchAndSetData();
    }, []);

    useEffect(() => {
        setTableFromPath();
        setFilterFromPath();
    }, [data.uniqueValues]);

    useEffect((): void => {
        if (!_.isEmpty(data.uniqueValues)) {
            fetchIsolateCounted();
        }
    }, [
        filter,
        table.row,
        table.column,
        isolateCountUrl,
        localStorage.getItem("i18nextLng"),
    ]);

    return (
        <LoadingOrErrorComponent
            status={{ isolateStatus, isolateCountStatus, filterStatus }}
            dataIsSet={!_.isEmpty(data.ZNData)}
            componentToDisplay={
                <QueryPageComponent
                    isCol={isCol}
                    isRow={isRow}
                    isFilter={isFilter}
                    colAttributes={columnAttributes}
                    nrOfSelectedIsol={nrOfSelectedIsol}
                    onDisplFeaturesChange={handleChangeDisplFeatures}
                    onDisplFeaturesSwap={handleSwapDisplFeatures}
                    onDisplFeaturesRemoveAll={handleRemoveAllDisplFeatures}
                    onFilterChange={handleChangeFilter}
                    onFilterRemoveAll={handleRemoveAllFilter}
                    onRadioChange={handleRadioChange}
                />
            }
        />
    );
}
