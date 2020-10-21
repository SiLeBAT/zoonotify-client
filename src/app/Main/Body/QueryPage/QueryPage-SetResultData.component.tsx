import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FilterContext } from "../../../Shared/Context/FilterContext";
import { FilterType } from "../../../Shared/Filter.model";
import { TableContext } from "../../../Shared/Context/TableContext";
import { DataContext } from "../../../Shared/Context/DataContext";
import { DBentry } from "../../../Shared/Isolat.model";
import { useFilter } from "../../../Core/FilterServices/filterData.service";
import { getValuesFromData } from "../../../Core/FilterServices/getValuesFromData.service";
import { CheckIfFilterIsSet } from "../../../Core/FilterServices/checkIfFilter.service";
import { QueryPageTableRestultComponent as ResultsData } from "./Results/QueryPage-ResultData.component";
import { getIsolatesRows } from "./Results/Results-CountIsolates.service";

export function SetDataComponent(): JSX.Element {
    const [state, setState] = useState<{
        isCol: boolean;
        isRow: boolean;
    }>({
        isCol: false,
        isRow: false,
    });
    const [columnAttributes, setColumnAttributes] = useState<string[]>([]);
    const { filter } = useContext(FilterContext);
    const { table, setTable } = useContext(TableContext);
    const { data, setData } = useContext(DataContext);
    const rowAttribute: FilterType = table.row;
    const colAttribute: FilterType = table.column;

    const { t } = useTranslation(["QueryPage"]);

    const getAllIsolates = async (
        dataToCountIsolates: DBentry[]
    ): Promise<void> => {
        const rowValues = getValuesFromData(
            rowAttribute,
            data.uniqueValues,
            filter.selectedFilter
        );
        const colValues = getValuesFromData(
            colAttribute,
            data.uniqueValues,
            filter.selectedFilter
        );
        if (rowAttribute.length !== 0 && colAttribute.length !== 0) {
            const rowsWithIsolates = getIsolatesRows(
                dataToCountIsolates,
                colAttribute,
                rowAttribute,
                rowValues,
                colValues,
                "both"
            );
            setState({
                isCol: true,
                isRow: true,
            });
            setColumnAttributes(colValues);
            setTable({
                ...table,
                statisticData: rowsWithIsolates,
            });
        } else if (rowAttribute.length === 0 && colAttribute.length !== 0) {
            const rowsWithIsolates = getIsolatesRows(
                dataToCountIsolates,
                colAttribute,
                rowAttribute,
                [t("Results.TableHead")],
                colValues,
                "col"
            );
            setState({
                isCol: true,
                isRow: false,
            });
            setColumnAttributes(colValues);
            setTable({
                ...table,
                statisticData: rowsWithIsolates,
            });
        } else if (colAttribute.length === 0 && rowAttribute.length !== 0) {
            const rowsWithIsolates = getIsolatesRows(
                dataToCountIsolates,
                colAttribute,
                rowAttribute,
                rowValues,
                [t("Results.TableHead")],
                "row"
            );
            setState({
                isCol: false,
                isRow: true,
            });
            setColumnAttributes([t("Results.TableHead")]);
            setTable({
                ...table,
                statisticData: rowsWithIsolates,
            });
        } else if (rowAttribute.length === 0 && colAttribute.length === 0) {
            setState({
                isCol: false,
                isRow: false,
            });
            setColumnAttributes([t("Results.TableHead")]);
            setTable({
                ...table,
                statisticData: [
                    {
                        "Number of isolates": String(
                            Object.keys(dataToCountIsolates).length
                        ),
                    },
                ],
            });
        }
    };

    useEffect((): void => {
        if (CheckIfFilterIsSet(filter.selectedFilter)) {
            setData({ ...data, ZNDataFiltered: data.ZNData });
            getAllIsolates(data.ZNData);
        } else {
            const filteredData = useFilter(data.ZNData, filter.selectedFilter);
            setData({ ...data, ZNDataFiltered: filteredData });
            getAllIsolates(filteredData);
        }
    }, [filter, table.column, table.row, localStorage.getItem("i18nextLng")]);

    return (
        <ResultsData
            displayRowCol={state}
            columnAttributes={columnAttributes}
        />
    );
}
