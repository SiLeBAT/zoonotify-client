/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { AccordionComponent } from "../../../../../Shared/Accordion.component";
import { ResultsTableOptionsComponent } from "./TableResults-Options.component";
import { ExplanationTextComponent } from "../../../../../Shared/ExplanationText.component";
import { TableInterface } from "../../../../../Shared/Context/TableContext";
import { TableResultsTableComponent } from "./TableResults-Table.component";

const dataStyle = css`
    max-width: fit-content;
    margin: auto;
    box-sizing: inherit;
`;

export interface TableResultsProps {
    tableIsLoading: boolean;
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
    tableData: TableInterface;
    onDisplayOptionsChange: (displayOption: string) => void;
}

/**
 * @desc Returns accordion to display the results in a table
 * @param props - info about isCol/isRow and columnAttributes
 * @returns {JSX.Element} - accordion with the result table
 */
export function QueryPageContentTableResultsLayoutComponent(
    props: TableResultsProps
): JSX.Element {
    const [isSumRowCol, setIsSumRowCol] = useState<{
        showRowSum: boolean;
        showColSum: boolean;
    }>({
        showRowSum: true,
        showColSum: true,
    });
    const { t } = useTranslation(["QueryPage"]);

    const handleChangeDisplayOptions = (displayOption: string): void =>
        props.onDisplayOptionsChange(displayOption);

    const handleShowRowColSum = (name: string, checked: boolean): void => {
        setIsSumRowCol({ ...isSumRowCol, [name]: checked });
    };

    const tableColAttribute = props.tableData.column;
    const tableRowAttribute = props.tableData.row;

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

    let tableData = props.tableData.statisticDataAbsolute;
    if (props.tableData.option === "relative") {
        tableData = props.tableData.statisticDataRelative;
    }

    if (isTable) {
        tableAccordionContent = (
            <div css={dataStyle}>
                <ResultsTableOptionsComponent
                    isSumRowCol={isSumRowCol}
                    tableOption={props.tableData.option}
                    onDisplayOptionsChange={handleChangeDisplayOptions}
                    onShowRowColSum={handleShowRowColSum}
                />
                <TableResultsTableComponent
                    isSumRowCol={isSumRowCol}
                    isLoading={props.tableIsLoading}
                    displayRowCol={props.displayRowCol}
                    colMainHeader={colMainHeader}
                    rowMainHeader={rowMainHeader}
                    tableData={tableData}
                    tableOption={props.tableData.option}
                    columnNameValues={props.columnNameValues}
                />
            </div>
        );
    }

    return (
        <AccordionComponent
            title={accordionHeader}
            content={tableAccordionContent}
            defaultExpanded
        />
    );
}
