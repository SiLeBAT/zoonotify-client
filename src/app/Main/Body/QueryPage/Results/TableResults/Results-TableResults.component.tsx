/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import _ from "lodash";
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
    const { table } = useContext(TableContext);
    const { t } = useTranslation(["QueryPage"]);

    const accordionHeader: string = t(`Results.Table`);
    const rowMainHeader: string = _.isEmpty(table.row)
        ? ""
        : t(`Filters.${table.row}`);
    const colMainHeader: string = _.isEmpty(table.column)
        ? ""
        : t(`Filters.${table.column}`);

    let tableAccordionContent = (
        <div css={dataStyle}>
            <ExplanationTextComponent />
        </div>
    );
    const isTable: boolean =
        props.displayRowCol.isCol || props.displayRowCol.isRow;
    const isRowAndCol: boolean =
        props.displayRowCol.isCol && props.displayRowCol.isRow;

    if (isTable) {
        tableAccordionContent = (
            <div css={dataStyle}>
                <ResultsTableOptionsComponent />
                <TableResultsTableMainHeaderComponent
                    isTitle={props.displayRowCol.isCol}
                    isRow={false}
                    text={colMainHeader}
                    isRowAndCol={isRowAndCol}
                />
                <div css={tableDivStyle}>
                    <TableResultsTableMainHeaderComponent
                        isTitle={props.displayRowCol.isRow}
                        isRow
                        text={rowMainHeader}
                        isRowAndCol={isRowAndCol}
                    />
                    <TableResultsTableContentComponent
                        columnAttributes={props.columnAttributes}
                        isRowAndCol={isRowAndCol}
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
