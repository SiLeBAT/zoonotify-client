import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FilterContext } from "../../../../Shared/Context/FilterContext";
import { FilterType } from "../../../../Shared/Model/Filter.model";
import { TableContext } from "../../../../Shared/Context/TableContext";
import { DataContext } from "../../../../Shared/Context/DataContext";
import { DBentry } from "../../../../Shared/Model/Isolat.model";
import { filterData } from "../../../../Core/FilterServices/filterData.service";
import { getValuesOfOneFilterAttribute } from "../../../../Core/FilterServices/getValuesOfOneFilterAttribute.service";
import { CheckIfFilterIsSet } from "../../../../Core/FilterServices/checkIfFilterIsSet.service";
import { ResultsTableRestultsComponent as TableResults } from "./TableResults/Results-TableResults.component";
import { generateRowsWithIsolates } from "./Results-RowsWithIsolates.service";

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
            const rowsWithIsolates = generateRowsWithIsolates(
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
            const rowsWithIsolates = generateRowsWithIsolates(
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
        <TableResults
            displayRowCol={state}
            columnAttributes={columnAttributes}
        />
    );
}
