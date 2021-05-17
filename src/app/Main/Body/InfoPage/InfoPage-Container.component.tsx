import React from "react";
import { useTranslation } from "react-i18next";
import { AmrKey, AmrsTable } from "./InfoPage.model";
import { InfoPageComponent } from "./InfoPage.component";
import { modifyTableDataStringService } from "../../../Core/modifyTableDataString.service";
import { tableAmrCampyRows, tableAmrEcoliSalmRows, tableAmrEcoliSalmTwoRows, tableAmrEfRows, tableAmrMrsaRows } from "./AmrsTables.constants";

export function InfoPageContainerComponent(): JSX.Element {
    const { t } = useTranslation(["InfoPage"]);

    const describedFilters = [
        "microorganism",
        "samplingYear",
        "samplingContext",
        "origin",
        "samplingStage",
        "category",
        "productionType",
        "matrix",
        "federalState",
        "resistance",
    ];


    const coliSalmTableHeader = [
        t("Methods.Amrs.TableHeaderClass"),
        t("Methods.Amrs.TableHeaderAmrSubstance"),
        t("Methods.Amrs.TableHeaderCuttOffSalm"),
        t("Methods.Amrs.TableHeaderCuttOffColi"),
        t("Methods.Amrs.TableHeaderMin"),
        t("Methods.Amrs.TableHeaderMax"),
    ];
    const oneCutOffTableHeader = [
        t("Methods.Amrs.TableHeaderClass"),
        t("Methods.Amrs.TableHeaderAmrSubstance"),
        t("Methods.Amrs.TableHeaderCuttOff"),
        t("Methods.Amrs.TableHeaderMin"),
        t("Methods.Amrs.TableHeaderMax"),
    ];
    const efTableHeader = [
        t("Methods.Amrs.TableHeaderClass"),
        t("Methods.Amrs.TableHeaderAmrSubstance"),
        t("Methods.Amrs.TableHeaderCuttOffFaecalis"),
        t("Methods.Amrs.TableHeaderCuttOffFaecium"),
        t("Methods.Amrs.TableHeaderMin"),
        t("Methods.Amrs.TableHeaderMax"),
    ];

    const amrKeys: AmrKey[] = [
        "coliSalm",
        "coliSalmTwo",
        "campy",
        "mrsa",
        "ef",
    ];

    const tableDataAmrColiSalm: AmrsTable = {
        title: t("Methods.Amrs.coliSalm.TableTitle"),
        description: t("Methods.Amrs.coliSalm.TableDescription"),
        tableHeader: coliSalmTableHeader,
        tableRows: tableAmrEcoliSalmRows,
        commentText: t("Methods.Amrs.coliSalm.TableComment"),
    };
    const tableDataAmrColiSalmTwo: AmrsTable = {
        title: t("Methods.Amrs.coliSalmTwo.TableTitle"),
        description: t("Methods.Amrs.coliSalmTwo.TableDescription"),
        tableHeader: coliSalmTableHeader,
        tableRows: tableAmrEcoliSalmTwoRows,
        commentText: t("Methods.Amrs.coliSalmTwo.TableComment"),
    };
    const tableDataAmrCampy: AmrsTable = {
        title: t("Methods.Amrs.campy.TableTitle"),
        description: t("Methods.Amrs.campy.TableDescription"),
        tableHeader: oneCutOffTableHeader,
        tableRows: tableAmrCampyRows,
        commentText: t("Methods.Amrs.campy.TableComment"),
    };
    const tableDataAmrMrsa: AmrsTable = {
        title: t("Methods.Amrs.mrsa.TableTitle"),
        description: t("Methods.Amrs.mrsa.TableDescription"),
        tableHeader: oneCutOffTableHeader,
        tableRows: tableAmrMrsaRows,
        commentText: t("Methods.Amrs.mrsa.TableComment"),
    };
    const tableDataAmrEf: AmrsTable = {
        title: t("Methods.Amrs.ef.TableTitle"),
        description: t("Methods.Amrs.ef.TableDescription"),
        tableHeader: efTableHeader,
        tableRows: tableAmrEfRows,
        commentText: t("Methods.Amrs.ef.TableComment"),
    };


    const amrTableData: Record<AmrKey, AmrsTable> = {
        coliSalm: tableDataAmrColiSalm,
        coliSalmTwo: tableDataAmrColiSalmTwo,
        campy: tableDataAmrCampy,
        mrsa: tableDataAmrMrsa,
        ef: tableDataAmrEf
    };



    const handleExportAmrData = (amrKey: AmrKey): void => {
        const csvHeader = amrTableData[amrKey].tableHeader.join(",");

        let csvContent = "";
        amrTableData[amrKey].tableRows.forEach((tableRow) => {
            const rowValues = Object.values(tableRow);
            const modifiedRowValues = rowValues.map((rowValue) =>
                modifyTableDataStringService(rowValue)
            );
            const modifiedRowValuesString = modifiedRowValues.join(",");
            csvContent += modifiedRowValuesString;
            csvContent += "\n";
        });
        const csvTable = `${csvHeader}\n${csvContent}`;
        const amrFileName = `${amrTableData[amrKey].title}.csv`.replace(/ /g, "_").replace("..", ".")
        const amrTableExportElement = document.createElement("a");
        amrTableExportElement.href = `data:text/csv;charset=utf-8,${encodeURI(csvTable)}`;
        amrTableExportElement.target = "_blank";
        amrTableExportElement.download = amrFileName;
        amrTableExportElement.click();
    };

    return (
        <InfoPageComponent
            amrKeys={amrKeys}
            tableData={amrTableData}
            describedFilters={describedFilters}
            onAmrDataExport={handleExportAmrData}
        />
    );
}
