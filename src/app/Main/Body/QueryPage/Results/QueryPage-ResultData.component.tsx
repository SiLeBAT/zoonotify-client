/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TableContext } from "../../../../Shared/Context/TableContext";
import { ResultsTableComponent as ResultsTable } from "./Results-Table.component";
import { TableMainHeaderComponent } from "./Result-MainHeader.component";

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
    const [windowSize, setWindowSize] = useState({
        width: 0,
        height: 0,
    });
    const [tableHeight, setTableHeight] = useState<number>(0);
    const [totalWidth, setTotalWidth] = useState<number>(0);
    const [partWidth, setPartWidth] = useState<number>(0);
    const { table } = useContext(TableContext);
    const { t } = useTranslation(["QueryPage"]);

    useEffect(() => {
        const handleSize = ():void => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
        window.addEventListener("resize", handleSize);
        return () => window.removeEventListener("resize", handleSize);
    }, []);

    const div = useCallback(
        (
            node: HTMLElement | null,
            key: "height" | "totalWidth" | "partWidth"
        ) => {
            if (node !== null) {
                if (key === "height") {
                    const { height } = node.getBoundingClientRect();
                    setTableHeight(height);
                }
                if (key === "totalWidth") {
                    const { width } = node.getBoundingClientRect();
                    setTotalWidth(width);
                }
                if (key === "partWidth") {
                    const { width } = node.getBoundingClientRect();
                    setPartWidth(width);
                }
            }
        },
        [table, windowSize]
    );

    const headerWidth: number = totalWidth - partWidth;

    const rowMainHeader: string = t(`Filters.${table.row}`);
    const colMainHeader: string = t(`Filters.${table.column}`);

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
            <TableMainHeaderComponent
                isTitle={props.displayRowCol.isCol}
                isRow={false}
                height={tableHeight}
                width={headerWidth}
                text={colMainHeader}
            />
            <div css={tableDivStyle}>
                <TableMainHeaderComponent
                    isTitle={props.displayRowCol.isRow}
                    isRow
                    height={tableHeight}
                    width={headerWidth}
                    text={rowMainHeader}
                />
                <div
                    css={dataTableStyle}
                    ref={(node: HTMLElement | null) => div(node, "totalWidth")}
                >
                    <ResultsTable
                        allIsolates={table.statisticData}
                        isIsolates={isIsolates}
                        columnAttributes={props.columnAttributes}
                        getSize={div}
                        isRowNotCol={isRowNotCol}
                    />
                </div>
            </div>
        </div>
    );
}
