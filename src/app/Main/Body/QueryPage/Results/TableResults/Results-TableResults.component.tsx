/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TableResultsTableContentComponent } from "./TableResults-TableContent.component";
import { TableResultsTableMainHeaderComponent } from "./TableResults-TableMainHeader.component";
import { AccordionComponent } from "../../../../../Shared/Accordion.component";
import { TableContext } from "../../../../../Shared/Context/TableContext";
import { ResultsTableOptionsComponent } from "./TableResults-Options.component";
import { ExplanationTextComponent } from "../../../../../Shared/ExplanationText.component";

const dataStyle = css`
    max-width: fit-content;
    margin: auto;
    box-sizing: inherit;
`;
const tableDivStyle = css`
    display: flex;
    flex-direction: row;
`;

export interface TableResultsProps {
    displayRowCol: {
        isCol: boolean;
        isRow: boolean;
    };
    columnAttributes: string[];
}

/**
 * @desc Returns accordion to display the results in a table
 * @param {{isCol: boolean; isRow: boolean;}} displayRowCol - object with two booleans, true if row/column is selected
 * @param {string[]} columnAttributes - attributes of the columns
 * @returns {JSX.Element} - accordion with the result table
 */
export function ResultsTableResultsComponent(
    props: TableResultsProps
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
        const handleSize = (): void => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };
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

    const accordionHeader: string = t(`Results.Table`);
    const rowMainHeader: string = t(`Filters.${table.row}`);
    const colMainHeader: string = t(`Filters.${table.column}`);

    let tableAccordionContent = (
        <div css={dataStyle}>
            <ExplanationTextComponent />
        </div>
    );
    const isTable: boolean =
        props.displayRowCol.isCol || props.displayRowCol.isRow;

    if (isTable) {
        tableAccordionContent = (
            <div css={dataStyle}>
                <ResultsTableOptionsComponent/>
                <TableResultsTableMainHeaderComponent
                    isTitle={props.displayRowCol.isCol}
                    isRow={false}
                    height={tableHeight}
                    width={headerWidth}
                    text={colMainHeader}
                />
                <div css={tableDivStyle}>
                    <TableResultsTableMainHeaderComponent
                        isTitle={props.displayRowCol.isRow}
                        isRow
                        height={tableHeight}
                        width={headerWidth}
                        text={rowMainHeader}
                    />
                    <TableResultsTableContentComponent
                        displayRowCol={props.displayRowCol}
                        columnAttributes={props.columnAttributes}
                        getSize={div}
                    />
                </div>
            </div>
        );
    }

    return (
        <AccordionComponent
            title={accordionHeader}
            content={tableAccordionContent}
        />
    );
}
