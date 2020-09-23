/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import {
    primaryColor,
    onPrimaryColor,
} from "../../../../Shared/Style/Style-MainTheme.component";
import { FilterContext } from "../../../../Shared/Context/FilterContext";
import { DataContext } from "../../../../Shared/Context/DataContext";
import { TableContext } from "../../../../Shared/Context/TableContext";
import { FilterType } from "../../../../Shared/Filter.model";
import { ResultsTableComponent } from "./Results-Table.component";
import { getIsolatesRows } from "./Results-CountIsolates.service";

const dataStyle = css`
    box-sizing: inherit;
    width: inherit;
    margin-left: 2em;
    overflow: auto;
`;
const tableDivStyle = css`
    display: flex;
    flex-direction: row;
`;
const tableTitleStyle = (
    isTitle: boolean,
    isRow: boolean
): SerializedStyles => css`
    display: ${isTitle ? "flex" : "none"};
    margin: 0;
    justify-content: center;
    font-weight: normal;
    background-color: ${primaryColor};
    color: ${onPrimaryColor};
    transform: ${isRow ? "rotate(180deg)" : "none"};
    writing-mode: ${isRow ? "vertical-lr" : "none"};
`;

export function QueryPageTableRestultComponent(): JSX.Element {
    const [state, setState] = useState<{
        isCol: boolean;
        isRow: boolean;
        columnAttributes: string[];
        allIsolates: Record<string, string>[];
    }>({
        isCol: false,
        isRow: false,
        columnAttributes: [],
        allIsolates: [],
    });
    const { filter } = useContext(FilterContext);
    const { data } = useContext(DataContext);
    const { table, setTable } = useContext(TableContext);
    const { t } = useTranslation(["QueryPage"]);

    const rowAttribute: FilterType = table.row;
    const colAttribute: FilterType = table.column;

    const getValuesFromData = (attribute: FilterType): string[] => {
        let values = data.uniqueValues[attribute];
        if (!_.isEmpty(filter[attribute])) {
            values = filter[attribute];
        }
        return values;
    };

    const getAllIsolates = async (): Promise<void> => {
        setState({ ...state, allIsolates: [] });
        const rowValues = getValuesFromData(rowAttribute);
        const colValues = getValuesFromData(colAttribute);
        if (rowAttribute.length !== 0 && colAttribute.length !== 0) {
            const rowsWithIsolates = getIsolatesRows(
                data.ZNData,
                colAttribute,
                rowAttribute,
                rowValues,
                colValues,
                "both"
            );
            setState({
                isCol: true,
                isRow: true,
                columnAttributes: colValues,
                allIsolates: rowsWithIsolates,
            })
            setTable({
                ...table,
                statisticData: rowsWithIsolates,
            });
        } else if (rowAttribute.length === 0) {
            const rowsWithIsolates = getIsolatesRows(
                data.ZNData,
                colAttribute,
                rowAttribute,
                [t("Results.TableHead")],
                colValues,
                "col"
            );
            setState({
                isCol: true,
                isRow: false,
                columnAttributes: colValues,
                allIsolates: rowsWithIsolates,
            });

            setTable({
                ...table,
                statisticData: rowsWithIsolates,
            });
        } else if (colAttribute.length === 0) {
            const rowsWithIsolates = getIsolatesRows(
                data.ZNData,
                colAttribute,
                rowAttribute,
                rowValues,
                [t("Results.TableHead")],
                "row"
            );
            setState({
                isCol: false,
                isRow: true,
                columnAttributes: [t("Results.TableHead")],
                allIsolates: rowsWithIsolates,
            });
            setTable({
                ...table,
                statisticData: rowsWithIsolates,
            });
        }
    };

    useEffect((): void => {
        getAllIsolates();
    }, [filter, table.column, table.row, localStorage.getItem("i18nextLng")]);

    return (
        <div css={dataStyle}>
            <h4 css={tableTitleStyle(state.isCol, false)}>
                {t(`Filters.${colAttribute}`)}
            </h4>
            <div css={tableDivStyle}>
                <h4 css={tableTitleStyle(state.isRow, true)}>
                    {t(`Filters.${rowAttribute}`)}
                </h4>
                <ResultsTableComponent
                    columnAttributes={state.columnAttributes}
                    allIsolates={state.allIsolates}
                />
            </div>
        </div>
    );
}
