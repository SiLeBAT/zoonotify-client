import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FilterContext } from "../../../../Shared/Context/FilterContext";
import { FilterType } from "../../../../Shared/Model/Filter.model";
import { TableContext } from "../../../../Shared/Context/TableContext";
import { DataContext } from "../../../../Shared/Context/DataContext";
import { DBentry } from "../../../../Shared/Model/Isolate.model";
import { filterData } from "../../../../Core/FilterServices/filterData.service";
import { getValuesOfOneFilterAttribute } from "../../../../Core/FilterServices/getValuesOfOneFilterAttribute.service";
import { CheckIfFilterIsSet } from "../../../../Core/FilterServices/checkIfFilterIsSet.service";
import { ResultsTableResultsComponent } from "./TableResults/Results-TableResults.component";
import { generateRowsWithIsolates } from "./Results-RowsWithIsolates.service";
import { calculateRowsWithPercent } from "../../../../Core/calculateRowsWithPercent.service";

export function ContentResultsComponent(): JSX.Element {
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
        const rowValues = getValuesOfOneFilterAttribute(
            rowAttribute,
            data.uniqueValues,
            filter
        );
        const colValues = getValuesOfOneFilterAttribute(
            colAttribute,
            data.uniqueValues,
            filter
        );
        if (rowAttribute.length !== 0 && colAttribute.length !== 0) {
            const rowsWithIsolates = generateRowsWithIsolates(
                dataToCountIsolates,
                colAttribute,
                rowAttribute,
                rowValues,
                colValues,
                "both"
            );
            const rowsWithPercent = calculateRowsWithPercent(rowsWithIsolates)
            setState({
                isCol: true,
                isRow: true,
            });
            setColumnAttributes(colValues);
            setTable({
                ...table,
                statisticDataAbsolute: rowsWithIsolates,
                statisticDataPercent: rowsWithPercent,
            });
        } else if (rowAttribute.length === 0 && colAttribute.length !== 0) {
            const rowsWithIsolates = generateRowsWithIsolates(
                dataToCountIsolates,
                colAttribute,
                rowAttribute,
                [t("Results.TableHead")],
                colValues,
                "col"
            );
            const rowsWithPercent = calculateRowsWithPercent(rowsWithIsolates)
            setState({
                isCol: true,
                isRow: false,
            });
            setColumnAttributes(colValues);
            setTable({
                ...table,
                statisticDataAbsolute: rowsWithIsolates,
                statisticDataPercent: rowsWithPercent,
            });
        } else if (colAttribute.length === 0 && rowAttribute.length !== 0) {
            const rowsWithIsolates = generateRowsWithIsolates(
                dataToCountIsolates,
                colAttribute,
                rowAttribute,
                rowValues,
                [t("Results.TableHead")],
                "row"
            );
            const rowsWithPercent = calculateRowsWithPercent(rowsWithIsolates)
            setState({
                isCol: false,
                isRow: true,
            });
            setColumnAttributes([t("Results.TableHead")]);
            setTable({
                ...table,
                statisticDataAbsolute: rowsWithIsolates,
                statisticDataPercent: rowsWithPercent,
            });
        } else if (rowAttribute.length === 0 && colAttribute.length === 0) {
            setState({
                isCol: false,
                isRow: false,
            });
            setColumnAttributes([t("Results.TableHead")]);
            setTable({
                ...table,
                statisticDataAbsolute: [
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
        if (CheckIfFilterIsSet(filter)) {
            setData({ ...data, ZNDataFiltered: data.ZNData });
            getAllIsolates(data.ZNData);
        } else {
            const filteredData = filterData(data.ZNData, filter);
            setData({ ...data, ZNDataFiltered: filteredData });
            getAllIsolates(filteredData);
        }
    }, [filter, table.column, table.row, localStorage.getItem("i18nextLng")]);

    return (
        <ResultsTableResultsComponent
            displayRowCol={state}
            columnAttributes={columnAttributes}
        />
    );
}
