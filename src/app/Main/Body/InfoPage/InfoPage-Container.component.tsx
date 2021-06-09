import React from "react";
import { useTranslation } from "react-i18next";
import { AmrKey, AmrsTable, microorganismNames } from "./InfoPage.model";
import { InfoPageComponent } from "./InfoPage.component";
import { modifyTableDataStringService } from "../../../Core/modifyTableDataString.service";
import {
    tableAmrCampyRows,
    tableAmrEcoliSalmRows,
    tableAmrEcoliSalmTwoRows,
    tableAmrEfRows,
    tableAmrMrsaRows,
} from "./AmrsTables.constants";

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
        introduction: (
            <p>
                {t(`Methods.Amrs.coliSalm.Paragraph.Description1`)}
                {microorganismNames.ColiShort}
                {t(`Methods.Amrs.coliSalm.Paragraph.Description2`)}
                {microorganismNames.ColiFull}
                {t(`Methods.Amrs.coliSalm.Paragraph.Description3`)}
            </p>
        ),
        title: (
            <div>
                {t("Methods.Amrs.coliSalm.TableTitle.Part1")}
                {microorganismNames.Salm} spp.
                {t("Methods.Amrs.coliSalm.TableTitle.Part2")}
                {microorganismNames.ColiFull}
            </div>
        ),
        description: t("Methods.Amrs.coliSalm.TableDescription"),
        tableHeader: coliSalmTableHeader,
        tableRows: tableAmrEcoliSalmRows,
        commentText: t("Methods.Amrs.coliSalm.TableComment"),
    };
    const tableDataAmrColiSalmTwo: AmrsTable = {
        introduction: (
            <p>
                {t("Methods.Amrs.coliSalmTwo.Paragraph.Description1")}
                {microorganismNames.Salm} spp.
                {t("Methods.Amrs.coliSalmTwo.Paragraph.Description2")}
                {microorganismNames.ColiFull}
                {t("Methods.Amrs.coliSalmTwo.Paragraph.Description3")}
            </p>
        ),
        title: (
            <div>
                {t("Methods.Amrs.coliSalmTwo.TableTitle.Part1")}
                {microorganismNames.Salm} spp.
                {t("Methods.Amrs.coliSalmTwo.TableTitle.Part2")}
                {microorganismNames.ColiFull}
                {t("Methods.Amrs.coliSalmTwo.TableTitle.Part3")}
            </div>
        ),
        description: t("Methods.Amrs.coliSalmTwo.TableDescription"),
        tableHeader: coliSalmTableHeader,
        tableRows: tableAmrEcoliSalmTwoRows,
        commentText: t("Methods.Amrs.coliSalmTwo.TableComment"),
    };
    const tableDataAmrCampy: AmrsTable = {
        introduction: (
            <p>
                {t(`Methods.Amrs.campy.Paragraph.Description1`)}
                {microorganismNames.CampyJeShort}
                {t(`Methods.Amrs.campy.Paragraph.Description2`)}
                {microorganismNames.CampyColiShort}
                {t(`Methods.Amrs.campy.Paragraph.Description3`)}
            </p>
        ),
        title: (
            <div>
                {t("Methods.Amrs.campy.TableTitle.Part1")}
                {microorganismNames.CampyJe}
                {t("Methods.Amrs.campy.TableTitle.Part2")}
                {microorganismNames.CampyColiShort}
            </div>
        ),
        description: t("Methods.Amrs.campy.TableDescription"),
        tableHeader: oneCutOffTableHeader,
        tableRows: tableAmrCampyRows,
        commentText: t("Methods.Amrs.campy.TableComment"),
    };
    const tableDataAmrMrsa: AmrsTable = {
        introduction: (
            <p>
                {t(`Methods.Amrs.mrsa.Paragraph.Description1`)} {microorganismNames.Staphy}
                {t(`Methods.Amrs.mrsa.Paragraph.Description2`)}
            </p>
        ),
        title: (
            <div>
                {t("Methods.Amrs.mrsa.TableTitle")}
                {microorganismNames.Staphy}
            </div>
        ),
        description: t("Methods.Amrs.mrsa.TableDescription"),
        tableHeader: oneCutOffTableHeader,
        tableRows: tableAmrMrsaRows,
        commentText: t("Methods.Amrs.mrsa.TableComment"),
    };
    const tableDataAmrEf: AmrsTable = {
        introduction: (
            <p>
                {t(`Methods.Amrs.ef.Paragraph.Description1`)}
                {microorganismNames.EnteroFaecalis}
                {t(`Methods.Amrs.ef.Paragraph.Description2`)}
                {microorganismNames.EnteroFaecium}
                {t(`Methods.Amrs.ef.Paragraph.Description3`)}
            </p>
        ),
        title: (
            <div>
                {t("Methods.Amrs.ef.TableTitle.Part1")}
                {microorganismNames.EnteroFaecalis}
                {t("Methods.Amrs.ef.TableTitle.Part2")}
                {microorganismNames.EnteroFaecium}
            </div>
        ),
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
        ef: tableDataAmrEf,
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
        const amrFileName = `${amrTableData[amrKey].title}.csv`
            .replace(/ /g, "_")
            .replace("..", ".");
        const amrTableExportElement = document.createElement("a");
        amrTableExportElement.href = `data:text/csv;charset=utf-8,${encodeURI(
            csvTable
        )}`;
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
