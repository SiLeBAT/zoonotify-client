/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import {
    primaryColor,
    onPrimaryColor,
} from "../../../../Shared/Style/Style-MainTheme.component";
import { TableContext } from "../../../../Shared/Context/TableContext";
import { FilterType } from "../../../../Shared/Filter.model";
import { ResultsTableComponent as ResultsTable } from "./Results-Table.component";

const dataStyle = (isRowAndCol: boolean): SerializedStyles => css`
    max-width: fit-content;
    margin: auto;
    box-sizing: inherit;
    border-right: ${isRowAndCol ? `1px solid ${primaryColor}` : "none"};
`;
const dataTableStyle = css`
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

interface TestInterface {
    displayRowCol: {
        isCol: boolean;
        isRow: boolean;
    };
    columnAttributes: string[];
}

export function QueryPageTableRestultComponent(
    props: TestInterface
): JSX.Element {
    const { table } = useContext(TableContext);
    const { t } = useTranslation(["QueryPage"]);

    const rowAttribute: FilterType = table.row;
    const colAttribute: FilterType = table.column;

    const isIsolates = !!(
        !props.displayRowCol.isCol && !props.displayRowCol.isRow
    );
    const isRowAndCol = !!(
        props.displayRowCol.isCol && props.displayRowCol.isRow
    );
    const isRowNotCol = !!(
        !props.displayRowCol.isCol && props.displayRowCol.isRow
    );

    return (
        <div css={dataStyle(isRowAndCol)}>
            <h4 css={tableTitleStyle(props.displayRowCol.isCol, false)}>
                {t(`Filters.${colAttribute}`)}
            </h4>
            <div css={tableDivStyle}>
                <h4 css={tableTitleStyle(props.displayRowCol.isRow, true)}>
                    {t(`Filters.${rowAttribute}`)}
                </h4>
                <div css={dataTableStyle}>
                    <ResultsTable
                        allIsolates={table.statisticData}
                        isIsolates={isIsolates}
                        columnAttributes={props.columnAttributes}
                        isRowNotCol={isRowNotCol}
                    />
                </div>
            </div>
        </div>
    );
}
