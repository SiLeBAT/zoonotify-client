/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { AccordionComponent } from "../../../../../Shared/Accordion.component";
import { ResultsTableOptionsComponent } from "./TableResults-Options.component";
import { ExplanationTextComponent } from "../../../../../Shared/ExplanationText.component";
import { DataInterface } from "../../../../../Shared/Context/DataContext";
import { TableResultsTableComponent } from "./TableResults-Table.component";
import { SumOptions } from "./TableResults.model";

const dataStyle = css`
    max-width: fit-content;
    margin: auto;
    box-sizing: inherit;
`;

export interface TableResultsProps {
    tableIsLoading: boolean;
    columnNameValues: string[];
    tableData: DataInterface;
    numberOfIsolates: number;
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
    const [sumOptions, setSumOptions] = useState<SumOptions>({
        showRowSum: true,
        showColSum: true,
    });
    const { t } = useTranslation(["QueryPage"]);

    const handleChangeDisplayOptions = (displayOption: string): void =>
        props.onDisplayOptionsChange(displayOption);

    const handleSumOptionsChange = (changedSumOptions: SumOptions): void => {
        setSumOptions(changedSumOptions);
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
    const isTable: boolean = props.tableData.row !== "" || props.tableData.column !== ""

    let tableData = props.tableData.statisticDataAbsolute;
    if (props.tableData.option === "relative") {
        tableData = props.tableData.statisticDataRelative;
    }

    if (isTable) {
        tableAccordionContent = (
            <div css={dataStyle}>
                <ResultsTableOptionsComponent
                    sumOptions={sumOptions}
                    tableOption={props.tableData.option}
                    onDisplayOptionsChange={handleChangeDisplayOptions}
                    onChangeSumOptions={handleSumOptionsChange}
                />
                <TableResultsTableComponent
                    sumOptions={sumOptions}
                    isLoading={props.tableIsLoading}
                    numberOfIsolates={props.numberOfIsolates}
                    colMainHeader={colMainHeader}
                    rowMainHeader={rowMainHeader}
                    tableData={tableData}
                    tableOption={props.tableData.option}
                    columnNameValues={props.columnNameValues}
                    colAttribute={tableColAttribute}
                    rowAttribute={tableRowAttribute}
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
