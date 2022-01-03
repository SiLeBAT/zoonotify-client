import React from "react";
import { useTranslation } from "react-i18next";
import { AmrKey, AmrsTable, microorganismNames } from "./InfoPage.model";
import { InfoPageComponent } from "./InfoPage.component";
import { modifyTableDataStringService } from "../../../Core/modifyTableDataString.service";
import {
    table3a,
    table1,
    table2,
    table4,
    table3b,
    years2010To2020,
    years2016To2020,
    table5,
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

    const tableHeader2010To2020 = [
        t("Methods.Amrs.TableHeaderClass"),
        t("Methods.Amrs.TableHeaderSubstance"),
        t("samplingYear.2010"),
        t("samplingYear.2011"),
        t("samplingYear.2012"),
        t("samplingYear.2013"),
        t("samplingYear.2014"),
        t("samplingYear.2015"),
        t("samplingYear.2016"),
        t("samplingYear.2017"),
        t("samplingYear.2018"),
        t("samplingYear.2019"),
        t("samplingYear.2020"),
    ];
    const tableHeader2016To2020 = [
        t("Methods.Amrs.TableHeaderClass"),
        t("Methods.Amrs.TableHeaderSubstance"),
        t("samplingYear.2016"),
        t("samplingYear.2017"),
        t("samplingYear.2018"),
        t("samplingYear.2019"),
        t("samplingYear.2020"),
    ];

    const tableSubHeader2010To2020 = ["", ""];

    years2010To2020.forEach(() => {
        tableSubHeader2010To2020.push(
            t("Methods.Amrs.TableHeaderCutOff"),
            t("Methods.Amrs.TableHeaderMin"),
            t("Methods.Amrs.TableHeaderMax")
        );
    });

    const tableSubHeader2016To2020 = ["", ""];
    years2016To2020.forEach(() => {
        tableSubHeader2016To2020.push(
            t("Methods.Amrs.TableHeaderCutOff"),
            t("Methods.Amrs.TableHeaderMin"),
            t("Methods.Amrs.TableHeaderMax")
        );
    });

    const amrKeys: AmrKey[] = [
        "table1Coli",
        "table2Salm",
        "table3aCampy",
        "table3bCampy",
        "table4Mrsa",
        "table5Ef",
    ];

    const table1Coli: AmrsTable = {
        introduction: (
            <p>
                {t(`Methods.Amrs.Table1.Paragraph.Description1`)}
                {microorganismNames.ColiShort}
                {t(`Methods.Amrs.Table1.Paragraph.Description2`)}
                {microorganismNames.ColiShort}
                {t(`Methods.Amrs.Table1.Paragraph.Description3`)}
            </p>
        ),
        title: (
            <div>
                {t("Methods.Amrs.Table1.TableTitle.Part1")}
                {microorganismNames.ColiFull}
            </div>
        ),
        titleString: t("Methods.Amrs.Table1.TableTitleString"),
        description: t("Methods.Amrs.Table1.TableDescription"),
        tableHeader: tableHeader2010To2020,
        tableSubHeader: tableSubHeader2010To2020,
        tableRows: table1,
    };
    const table2Salm: AmrsTable = {
        introduction: (
            <p>
                {t("Methods.Amrs.Table2.Paragraph.Description1")}
                {microorganismNames.Salm} spp.
                {t("Methods.Amrs.Table2.Paragraph.Description2")}
            </p>
        ),
        title: (
            <div>
                {t("Methods.Amrs.Table2.TableTitle.Part1")}
                {microorganismNames.Salm} spp.
            </div>
        ),
        titleString: t("Methods.Amrs.Table2.TableTitleString"),
        description: t("Methods.Amrs.Table2.TableDescription"),
        tableHeader: tableHeader2010To2020,
        tableSubHeader: tableSubHeader2010To2020,
        tableRows: table2,
    };
    const table3aCampy: AmrsTable = {
        introduction: (
            <p>
                {t(`Methods.Amrs.Table3a.Paragraph.Description1`)}
                {microorganismNames.CampyJeShort}
                {t(`Methods.Amrs.Table3a.Paragraph.Description2`)}
                {microorganismNames.CampyColiShort}
                {t(`Methods.Amrs.Table3a.Paragraph.Description3`)}
            </p>
        ),
        title: (
            <div>
                {t("Methods.Amrs.Table3a.TableTitle.Part1")}
                {microorganismNames.CampyJe}
            </div>
        ),
        titleString: t("Methods.Amrs.Table3a.TableTitleString"),
        description: t("Methods.Amrs.Table3a.TableDescription"),
        tableHeader: tableHeader2010To2020,
        tableSubHeader: tableSubHeader2010To2020,
        tableRows: table3a,
    };
    const table3bCampy: AmrsTable = {
        introduction: <p>{t(`Methods.Amrs.Table3b.Paragraph`)}</p>,
        title: (
            <div>
                {t("Methods.Amrs.Table3b.TableTitle.Part1")}
                {microorganismNames.CampyColi}
            </div>
        ),
        titleString: t("Methods.Amrs.Table3b.TableTitleString"),
        description: t("Methods.Amrs.Table3b.TableDescription"),
        tableHeader: tableHeader2010To2020,
        tableSubHeader: tableSubHeader2010To2020,
        tableRows: table3b,
    };
    const table4Mrsa: AmrsTable = {
        introduction: (
            <p>
                {t(`Methods.Amrs.Table4.Paragraph.Description1`)}
                {microorganismNames.Staphy}
                {t(`Methods.Amrs.Table4.Paragraph.Description2`)}
                <a
                    rel="noreferrer"
                    target="_blank"
                    href="https://mic.eucast.org/"
                >
                    {t(`Methods.Amrs.Table4.Paragraph.EucastLink`)}
                </a>
                {t(`Methods.Amrs.Table4.Paragraph.Description3`)}
            </p>
        ),
        title: (
            <div>
                {t("Methods.Amrs.Table4.TableTitle")}
                {microorganismNames.Staphy}
            </div>
        ),
        titleString: t("Methods.Amrs.Table4.TableTitleString"),
        description: t("Methods.Amrs.Table4.TableDescription"),
        tableHeader: tableHeader2010To2020,
        tableSubHeader: tableSubHeader2010To2020,
        tableRows: table4,
    };
    const table5Ef: AmrsTable = {
        introduction: (
            <p>
                {t(`Methods.Amrs.Table5.Paragraph.Description1`)}
                {microorganismNames.EnteroFaecalis}
                {t(`Methods.Amrs.Table5.Paragraph.Description2`)}
                {microorganismNames.EnteroFaecium}
                {t(`Methods.Amrs.Table5.Paragraph.Description3`)}
            </p>
        ),
        title: (
            <div>
                {t("Methods.Amrs.Table5.TableTitle.Part1")}
                {microorganismNames.EnteroFaecalis}
                {t("Methods.Amrs.Table5.TableTitle.Part2")}
                {microorganismNames.EnteroFaecium}
            </div>
        ),
        titleString: t("Methods.Amrs.Table5.TableTitleString"),
        description: t("Methods.Amrs.Table5.TableDescription"),
        tableHeader: tableHeader2016To2020,
        tableSubHeader: tableSubHeader2016To2020,
        tableRows: table5,
    };

    const amrTableData: Record<AmrKey, AmrsTable> = {
        table1Coli,
        table2Salm,
        table3aCampy,
        table3bCampy,
        table4Mrsa,
        table5Ef,
    };

    const handleExportAmrData = (amrKey: AmrKey): void => {
        let csvContent = "";

        csvContent += `"${amrTableData[amrKey].titleString}"`;
        csvContent += "\n";
        csvContent += `"${amrTableData[amrKey].description}"`;
        csvContent += "\n";
        csvContent += "\n";
        csvContent += `"${amrTableData[amrKey].tableHeader.join(",")}"`;
        csvContent += "\n";

        amrTableData[amrKey].tableRows.forEach((tableRow) => {
            const rowValues = Object.values(tableRow);
            const modifiedRowValues = rowValues.map((rowValue) =>
                modifyTableDataStringService(rowValue)
            );
            const modifiedRowValuesString = modifiedRowValues.join(",");
            csvContent += modifiedRowValuesString;
            csvContent += "\n";
        });

        const csvTable = csvContent;
        const amrFileName = `${amrTableData[amrKey].titleString}.csv`
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
