/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { TableResultsTableContentComponent } from "./TableResults-TableContent.component";
import { TableResultsTableMainHeaderComponent } from "./TableResults-TableMainHeader.component";
import { AccordionComponent } from "../../../../../Shared/Accordion.component";
import { ResultsTableOptionsComponent } from "./TableResults-Options.component";
import { ExplanationTextComponent } from "../../../../../Shared/ExplanationText.component";
import { TableInterface } from "../../../../../Shared/Context/TableContext";

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
    /**
     * object with two booleans, true if row/column is selected
     */
    displayRowCol: {
        isCol: boolean;
        isRow: boolean;
    };
    /**
     * attributes of the columns
     */
    columnNameValues: string[];
    tableData: TableInterface
    onRadioChange: (eventTargetValue: string) => void;
}

/**
 * @desc Returns accordion to display the results in a table
 * @param props - info about isCol/isRow and columnAttributes
 * @returns {JSX.Element} - accordion with the result table
 */
export function QueryPageContentTableResultsLayoutComponent(
    props: TableResultsProps
): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    const handleChangeRadio = (eventTargetValue: string): void =>
        props.onRadioChange(eventTargetValue);


    const tableColAttribute = props.tableData.column
    const tableRowAttribute = props.tableData.row

    const accordionHeader: string = t(`Results.Table`);
    const rowMainHeader: string = _.isEmpty(tableRowAttribute)
        ? ""
        : t(`Filters.${tableRowAttribute}`);
    const colMainHeader: string = _.isEmpty(tableColAttribute)
        ? ""
        : t(`Filters.${tableColAttribute}`);

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
                <ResultsTableOptionsComponent
                    tableOption={props.tableData.option}
                    onRadioChange={handleChangeRadio}
                />
                {props.displayRowCol.isCol && (
                    <TableResultsTableMainHeaderComponent
                        isRow={false}
                        text={colMainHeader}
                        isRowAndCol={isRowAndCol}
                    />
                )}
                <div css={tableDivStyle}>
                    {props.displayRowCol.isRow && (
                        <TableResultsTableMainHeaderComponent
                            isRow
                            text={rowMainHeader}
                            isRowAndCol={isRowAndCol}
                        />
                    )}
                    <TableResultsTableContentComponent
                        tables={{
                            statisticDataAbsolute: props.tableData.statisticDataAbsolute,
                            statisticDataRelative: props.tableData.statisticDataRelative
                        }}
                        tableOption={props.tableData.option}
                        columnNameValues={props.columnNameValues}
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
