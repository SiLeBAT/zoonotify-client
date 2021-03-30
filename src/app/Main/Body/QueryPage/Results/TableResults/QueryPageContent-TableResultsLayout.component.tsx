/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { TableResultsTableContentComponent } from "./TableResults-TableContent.component";
import { TableResultsTableMainHeaderComponent } from "./TableResults-TableMainHeader.component";
import { AccordionComponent } from "../../../../../Shared/Accordion.component";
import { ResultsTableOptionsComponent } from "./TableResults-Options.component";
import { ExplanationTextComponent } from "../../../../../Shared/ExplanationText.component";
import { DisplayOptionType } from "../../../../../Shared/Context/TableContext";

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
    columnAttributes: string[];
    tableColumn: string;
    tableRow: string;
    tableOption: DisplayOptionType;
    tables: {
        statisticDataAbsolute: Record<string, string>[];
        statisticDataPercent: Record<string, string>[];
    };
    onRadioChange: (eventTargetValue: string) => void;
}

/**
 * @desc Returns accordion to display the results in a table
 * @param {TableResultsProps} props - info about isCol/isRow and columnAttributes
 * @returns {JSX.Element} - accordion with the result table
 */
export function QueryPageContentTableResultsLayoutComponent(
    props: TableResultsProps
): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    const handleChangeRadio = (eventTargetValue: string): void =>
        props.onRadioChange(eventTargetValue);

    const accordionHeader: string = t(`Results.Table`);
    const rowMainHeader: string = _.isEmpty(props.tableRow)
        ? ""
        : t(`Filters.${props.tableRow}`);
    const colMainHeader: string = _.isEmpty(props.tableColumn)
        ? ""
        : t(`Filters.${props.tableColumn}`);

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
                    tableOption={props.tableOption}
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
                            statisticDataAbsolute: props.tables.statisticDataAbsolute,
                            statisticDataPercent: props.tables.statisticDataPercent
                        }}
                        tableOption={props.tableOption}
                        columnAttributes={props.columnAttributes}
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
