import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { ResultsTableOptionsComponent } from "./TableResults-Options.component";
import { ExplanationTextComponent } from "../../../../../../Shared/ExplanationText.component";
import { DataInterface } from "../../../../../../Shared/Context/DataContext";
import { TableContainer } from "./Table/Table-Container.component";
import { SumOptions } from "./TableResults.model";
import { LoadingProcessComponent } from "../../../../../../Shared/LoadingProcess.component";
import { AccordionComponent } from "../../../../../../Shared/Accordion.component";

export interface TableResultsProps {
    tableIsLoading: boolean;
    isSubFilter: boolean;
    columnNameValues: string[];
    tableData: DataInterface;
    onDisplayOptionsChange: (displayOption: string) => void;
}

/**
 * @desc Returns accordion to display the results in a table
 * @param props - info about isCol/isRow and columnAttributes
 * @returns {JSX.Element} - accordion with the result table
 */
export function TableResultsContainer(props: TableResultsProps): JSX.Element {
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
        <ExplanationTextComponent text={t("Explanation")} />
    );
    const isTable: boolean =
        props.tableData.row !== "" || props.tableData.column !== "";

    let tableData = props.tableData.statTableDataWithSumsAbs;
    let subTableData = props.tableData.statisticSubTableDataAbs;
    if (props.tableData.option === "relative") {
        tableData = props.tableData.statTableDataWithSumsRel;
        subTableData = props.tableData.statisticSubTableDataRel;
    }

    if (isTable && !props.tableIsLoading) {
        tableAccordionContent = (
            <div>
                <ResultsTableOptionsComponent
                    sumOptions={sumOptions}
                    tableOption={props.tableData.option}
                    onDisplayOptionsChange={handleChangeDisplayOptions}
                    onChangeSumOptions={handleSumOptionsChange}
                />
                <TableContainer
                    sumOptions={sumOptions}
                    colMainHeader={colMainHeader}
                    rowMainHeader={rowMainHeader}
                    tableData={tableData}
                    subTableData={subTableData}
                    tableOption={props.tableData.option}
                    columnNameValues={props.columnNameValues}
                    colAttribute={tableColAttribute}
                    rowAttribute={tableRowAttribute}
                    isSubFilter={props.isSubFilter}
                />
            </div>
        );
    }

    if (isTable && props.tableIsLoading) {
        tableAccordionContent = (
            <div>
                <ResultsTableOptionsComponent
                    sumOptions={sumOptions}
                    tableOption={props.tableData.option}
                    onDisplayOptionsChange={handleChangeDisplayOptions}
                    onChangeSumOptions={handleSumOptionsChange}
                />
                <LoadingProcessComponent />
            </div>
        );
    }

    return (
        <AccordionComponent
            title={accordionHeader}
            content={tableAccordionContent}
            defaultExpanded
            centerContent
        />
    );
}
