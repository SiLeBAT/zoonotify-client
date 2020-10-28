/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { TableContext } from "../../../../Shared/Context/TableContext";
import { ResultsTableComponent as ResultsTable } from "./Results-Table.component";
import { TableMainHeaderComponent } from "./Result-MainHeader.component";

const dataStyle = css`
    max-width: fit-content;
    margin: auto;
    box-sizing: inherit;
`;
const dataTableStyle = css`
    overflow: auto;
`;
const tableDivStyle = css`
    display: flex;
    flex-direction: row;
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
    const [height, setHeight] = useState<number>(0);
    const [wholeWidth, setWidth] = useState<number>(0);
    const [smallWidth, setSmallWidth] = useState<number>(0);
    const { table } = useContext(TableContext);
    const { t } = useTranslation(["QueryPage"]);

    const div = useCallback(
        (node: HTMLElement | null, key: string) => {
            if (node !== null) {
                if (key === "height") {
                    setHeight(node.getBoundingClientRect().height);
                }
                if (key === "wholeWidth") {
                    setWidth(node.getBoundingClientRect().width);
                }
                if (key === "smallWidth")
                    setSmallWidth(node.getBoundingClientRect().width);
            }
        },
        [table]
    );

    const width: number = wholeWidth - smallWidth;

    const rowMainHeader: string = t(`Filters.${table.row}`);
    const colMainHeader: string = t(`Filters.${table.column}`);

    let isIsolates = false;

    if (!props.displayRowCol.isCol && !props.displayRowCol.isRow) {
        isIsolates = true;
    }

    return (
        <div css={dataStyle}>
            <TableMainHeaderComponent
                isTitle={props.displayRowCol.isCol}
                isRow={false}
                height={height}
                width={width}
                text={colMainHeader}
            />
            <div css={tableDivStyle}>
                <TableMainHeaderComponent
                    isTitle={props.displayRowCol.isRow}
                    isRow
                    height={height}
                    width={width}
                    text={rowMainHeader}
                />
                <div css={dataTableStyle}>
                    <ResultsTable
                        allIsolates={table.statisticData}
                        isIsolates={isIsolates}
                        columnAttributes={props.columnAttributes}
                        getSize={div}
                    />
                </div>
            </div>
        </div>
    );
}
