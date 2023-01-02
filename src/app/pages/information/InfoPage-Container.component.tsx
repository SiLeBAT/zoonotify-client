import React from "react";
import { useTranslation } from "react-i18next";
import {
    table1,
    table2,
    table3a,
    table3b,
    table4,
    table5,
    years2010To2020,
    years2016To2020,
} from "./AmrsTables.constants";
import { getMicroorgaNameAsString } from "./getMicroorgaName.service";
import { InfoPageComponent } from "./InfoPage.component";
import { AmrKey, AmrsTable } from "./InfoPage.model";
import {
    campyColi,
    campyColiShort,
    campyJe,
    campyJeShort,
    coliFull,
    coliShort,
    enteroFaecalis,
    enteroFaecium,
    salmSpp,
    staphy,
} from "./italicNames.constants";

export function InfoPageContainerComponent(): JSX.Element {
    const { t } = useTranslation(["InfoPage"]);

    function modifyTableDataStringService(inputString: string): string {
        return `"${inputString.replace(/"/g, '\\"').replace("undefined", "")}"`;
    }

    const tableHeader2010To2020 = [
        t("Methods.Amrs.TableHeaderShortSub"),
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
        t("Methods.Amrs.TableHeaderShortSub"),
        t("Methods.Amrs.TableHeaderClass"),
        t("Methods.Amrs.TableHeaderSubstance"),
        t("samplingYear.2016"),
        t("samplingYear.2017"),
        t("samplingYear.2018"),
        t("samplingYear.2019"),
        t("samplingYear.2020"),
    ];

    const tableSubHeader2010To2020: Record<string, string[]> = {};

    for (const year of years2010To2020) {
        tableSubHeader2010To2020[year] = [
            t("Methods.Amrs.TableHeaderCutOff"),
            t("Methods.Amrs.TableHeaderMin"),
            t("Methods.Amrs.TableHeaderMax"),
        ];
    }

    const tableSubHeader2016To2020: Record<string, string[]> = {};
    for (const year of years2016To2020) {
        tableSubHeader2016To2020[year] = [
            t("Methods.Amrs.TableHeaderCutOff"),
            t("Methods.Amrs.TableHeaderMin"),
            t("Methods.Amrs.TableHeaderMax"),
        ];
    }

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
                {coliShort}
                {t(`Methods.Amrs.Table1.Paragraph.Description2`)}
                {coliShort}
                {t(`Methods.Amrs.Table1.Paragraph.Description3`)}
            </p>
        ),
        title: (
            <div>
                {t("Methods.Amrs.Table1.TableTitle.Part1")}
                {coliFull}
            </div>
        ),
        titleString: `${t(
            "Methods.Amrs.Table1.TableTitle.Part1"
        )} ${getMicroorgaNameAsString("fullName", "Coli")}`,
        description: t("Methods.Amrs.Table1.TableDescription"),
        tableHeader: tableHeader2010To2020,
        tableSubHeader: tableSubHeader2010To2020,
        tableRows: table1,
    };
    const table2Salm: AmrsTable = {
        introduction: (
            <p>
                {t("Methods.Amrs.Table2.Paragraph.Description1")}
                {salmSpp}
                {t("Methods.Amrs.Table2.Paragraph.Description2")}
            </p>
        ),
        title: (
            <div>
                {t("Methods.Amrs.Table2.TableTitle.Part1")}
                {salmSpp}
            </div>
        ),
        titleString: `${t(
            "Methods.Amrs.Table2.TableTitle.Part1"
        )} ${getMicroorgaNameAsString("spp", "Salm")}`,
        description: t("Methods.Amrs.Table2.TableDescription"),
        tableHeader: tableHeader2010To2020,
        tableSubHeader: tableSubHeader2010To2020,
        tableRows: table2,
    };
    const table3aCampy: AmrsTable = {
        introduction: (
            <p>
                {t(`Methods.Amrs.Table3a.Paragraph.Description1`)}
                {campyJeShort}
                {t(`Methods.Amrs.Table3a.Paragraph.Description2`)}
                {campyColiShort}
                {t(`Methods.Amrs.Table3a.Paragraph.Description3`)}
            </p>
        ),
        title: (
            <div>
                {t("Methods.Amrs.Table3a.TableTitle.Part1")}
                {campyJe}
            </div>
        ),
        titleString: `${t(
            "Methods.Amrs.Table3a.TableTitle.Part1"
        )} ${getMicroorgaNameAsString("fullName", "CampyJe")}`,
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
                {campyColi}
            </div>
        ),
        titleString: `${t(
            "Methods.Amrs.Table3b.TableTitle.Part1"
        )} ${getMicroorgaNameAsString("fullName", "CampyColi")}`,
        description: t("Methods.Amrs.Table3b.TableDescription"),
        tableHeader: tableHeader2010To2020,
        tableSubHeader: tableSubHeader2010To2020,
        tableRows: table3b,
    };
    const table4Mrsa: AmrsTable = {
        introduction: (
            <p>
                {t(`Methods.Amrs.Table4.Paragraph.Description1`)}
                {staphy}
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
                {staphy}
            </div>
        ),
        titleString: `${t(
            "Methods.Amrs.Table4.TableTitle"
        )} ${getMicroorgaNameAsString("fullName", "Staphy")}`,
        description: t("Methods.Amrs.Table4.TableDescription"),
        tableHeader: tableHeader2010To2020,
        tableSubHeader: tableSubHeader2010To2020,
        tableRows: table4,
    };
    const table5Ef: AmrsTable = {
        introduction: (
            <p>
                {t(`Methods.Amrs.Table5.Paragraph.Description1`)}
                {enteroFaecalis}
                {t(`Methods.Amrs.Table5.Paragraph.Description2`)}
                {enteroFaecium}
                {t(`Methods.Amrs.Table5.Paragraph.Description3`)}
            </p>
        ),
        title: (
            <div>
                {t("Methods.Amrs.Table5.TableTitle.Part1")}
                {enteroFaecalis}
                {t("Methods.Amrs.Table5.TableTitle.Part2")}
                {enteroFaecium}
            </div>
        ),
        titleString: `${t(
            "Methods.Amrs.Table5.TableTitle.Part1"
        )} ${getMicroorgaNameAsString("fullName", "EnteroFaecalis")} ${t(
            "Methods.Amrs.Table5.TableTitle.Part2"
        )} ${getMicroorgaNameAsString("fullName", "EnteroFaecium")}`,
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
        csvContent += `${amrTableData[amrKey].tableHeader[0]},`;
        csvContent += `${amrTableData[amrKey].tableHeader[1]},`;
        csvContent += `${amrTableData[amrKey].tableHeader
            .slice(2)
            .join(",,,")}`;
        csvContent += "\n";

        csvContent += ",,,";
        for (const year of Object.keys(amrTableData[amrKey].tableSubHeader)) {
            const yearSubHeader = amrTableData[amrKey].tableSubHeader[year];
            csvContent += `${yearSubHeader.join(",")}`;
            csvContent += ",";
        }
        csvContent += "\n";

        for (const tableRow of amrTableData[amrKey].tableRows) {
            const newRow = [];
            newRow.push(modifyTableDataStringService(tableRow.shortSubstance));
            newRow.push(modifyTableDataStringService(tableRow.substanceClass));
            newRow.push(modifyTableDataStringService(tableRow.amrSubstance));
            for (const year of Object.keys(tableRow.concentrationList)) {
                const rowValues = Object.values(
                    tableRow.concentrationList[year]
                );
                const modifiedRowValues = rowValues.map((rowValue) =>
                    modifyTableDataStringService(rowValue)
                );
                newRow.push(modifiedRowValues.join(","));
            }
            csvContent += newRow.join(",");
            csvContent += "\n";
        }

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
            onAmrDataExport={handleExportAmrData}
        />
    );
}
