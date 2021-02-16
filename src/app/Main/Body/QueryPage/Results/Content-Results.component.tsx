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

export function ContentResultsComponent(): JSX.Element {
    const [columnAttributes, setColumnAttributes] = useState<string[]>([]);
    const { filter } = useContext(FilterContext);
    const { table, setTable } = useContext(TableContext);
    const { data, setData } = useContext(DataContext);
    const history = useHistory();
    const { t } = useTranslation(["QueryPage"]);

    const rowAttribute: FilterType = table.row;
    const colAttribute: FilterType = table.column;
    const isCol: boolean = colAttribute !== "";
    const isRow: boolean = rowAttribute !== "";
    const state = { isCol, isRow };

    const getTableContext = async (
        isolateCountProp: IsolateCountedDTO
    ): Promise<void> => {
        if (!isCol && !isRow) {
            setTable({
                ...table,
                statisticDataAbsolute: [],
            });
        } else {
            const rowValues: string[] = !isRow
                ? [t("Results.TableHead")]
                : (_.isEmpty(filter.selectedFilter[rowAttribute])
                ? data.uniqueValues[rowAttribute]
                : filter.selectedFilter[rowAttribute])

            const colValues: string[] = !isCol
                ? [t("Results.TableHead")]
                : (_.isEmpty(filter.selectedFilter[colAttribute])
                ? data.uniqueValues[colAttribute]
                : filter.selectedFilter[colAttribute])

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
                                ] = (isolateGroup.count as unknown) as string;
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
        const isolateCountProp: IsolateCountedDTO = await isolateCountResponse.json();

        getTableContext(isolateCountProp);
        setData({
            ...data,
            nrOfSelectedIsolates: isolateCountProp.totalNumberOfIsolates,
        });
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
        <ResultsTableResultsComponent
            displayRowCol={state}
            columnAttributes={columnAttributes}
        />
    );
}
