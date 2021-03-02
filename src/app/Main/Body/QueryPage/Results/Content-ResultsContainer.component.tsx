import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import _ from "lodash";
import { FilterContext } from "../../../../Shared/Context/FilterContext";
import { FilterType } from "../../../../Shared/Model/Filter.model";
import { TableContext } from "../../../../Shared/Context/TableContext";
import { DataContext } from "../../../../Shared/Context/DataContext";
import { ResultsTableResultsComponent } from "./TableResults/Results-TableResults.component";
import { calculateRowsWithPercent } from "./calculateRowsWithPercent.service";
import { isolateCountURL } from "../../../../Shared/URLs";
import { IsolateCountedDTO } from "../../../../Shared/Model/Api_Isolate.model";
import { LoadingOrErrorComponent } from "../../../../Shared/LoadingOrError.component";

export function ContentResultsContainerComponent(props: {
    isCol: boolean;
    isRow: boolean;
}): JSX.Element {
    const [columnAttributes, setColumnAttributes] = useState<string[]>([]);
    const [countedStatus, setCountedStatus] = useState<number>();
    const { filter } = useContext(FilterContext);
    const { table, setTable } = useContext(TableContext);
    const { data, setData } = useContext(DataContext);
    const history = useHistory();
    const { t } = useTranslation(["QueryPage"]);

    const rowAttribute: FilterType = table.row;
    const colAttribute: FilterType = table.column;

    const getTableContext = async (
        isolateCountProp: IsolateCountedDTO
    ): Promise<void> => {
        if (!props.isCol && !props.isRow) {
            setTable({
                ...table,
                statisticDataAbsolute: [],
            });
        } else {
            let rowValues: string[] = [t("Results.TableHead")]
            if (props.isRow) {
                const isEmptyFilter = _.isEmpty(filter.selectedFilter[rowAttribute])
                rowValues = isEmptyFilter ? data.uniqueValues[rowAttribute] : filter.selectedFilter[rowAttribute]
            }
            let colValues: string[] = [t("Results.TableHead")]
            if (props.isCol) {
                const isEmptyFilter = _.isEmpty(filter.selectedFilter[colAttribute])
                colValues = isEmptyFilter ? data.uniqueValues[colAttribute] : filter.selectedFilter[colAttribute]
            }

            const isolateColValues: string[] = [t("Results.TableHead")];
            const isolateRowValues: string[] = [t("Results.TableHead")];
            isolateCountProp.groups.forEach((isolateCount) => {
                isolateColValues.push(isolateCount[colAttribute]);
                isolateRowValues.push(isolateCount[rowAttribute]);
            });
            const uniqIsolateColValues = _.uniq(isolateColValues);
            const uniqIsolateRowValues = _.uniq(isolateRowValues);

            const statisticTableDataAbs: Record<string, string>[] = [];

            rowValues.forEach((rowElement) => {
                const tempStatTable: Record<string, string> = {};
                tempStatTable.name = rowElement;
                colValues.forEach((colElement) => {
                    if (
                        _.includes(uniqIsolateColValues, colElement) &&
                        _.includes(uniqIsolateRowValues, rowElement)
                    ) {
                        isolateCountProp.groups.forEach((isolateGroup) => {
                            if (
                                (isolateGroup[rowAttribute] === rowElement ||
                                    isolateGroup[rowAttribute] === undefined) &&
                                (isolateGroup[colAttribute] === colElement ||
                                    isolateGroup[colAttribute] === undefined)
                            ) {
                                const statTableKey =
                                    isolateGroup[colAttribute] === undefined
                                        ? t("Results.TableHead")
                                        : isolateGroup[colAttribute];
                                tempStatTable[
                                    statTableKey
                                ] = String(isolateGroup.count);
                            }
                        });
                    } else {
                        tempStatTable[colElement] = "0";
                    }
                });
                statisticTableDataAbs.push(tempStatTable);
            });

            const nrOfSelectedIsolates = isolateCountProp.totalNumberOfIsolates;
            const rowsWithPercent = calculateRowsWithPercent(
                statisticTableDataAbs,
                nrOfSelectedIsolates
            );
            setColumnAttributes(colValues);
            setTable({
                ...table,
                statisticDataAbsolute: statisticTableDataAbs,
                statisticDataPercent: rowsWithPercent,
            });
        }
    };

    const ISOLATE_COUNT_URL: string = isolateCountURL + history.location.search;

    const fetchIsolateCounted = async (): Promise<void> => {
        const isolateCountResponse: Response = await fetch(ISOLATE_COUNT_URL);
        const isolateCountStatus = isolateCountResponse.status;
        setCountedStatus(isolateCountStatus);

        if (isolateCountStatus === 200) {
            const isolateCountProp: IsolateCountedDTO = await isolateCountResponse.json();
            getTableContext(isolateCountProp);
            setData({
                ...data,
                nrOfSelectedIsolates: isolateCountProp.totalNumberOfIsolates,
            });
        }
    };

    useEffect((): void => {
        fetchIsolateCounted();
    }, [
        filter,
        table.column,
        table.row,
        ISOLATE_COUNT_URL,
        localStorage.getItem("i18nextLng"),
    ]);

    return (
        <LoadingOrErrorComponent
            status={{
                isolateStatus: 200,
                isolateCountStatus: countedStatus,
                filterStatus: 200,
            }}
            dataIsSet={!_.isEmpty(data.ZNData)}
            componentToDisplay={
                <ResultsTableResultsComponent
                    displayRowCol={{ isCol: props.isCol, isRow: props.isRow }}
                    columnAttributes={columnAttributes}
                />
            }
        />
    );
}
