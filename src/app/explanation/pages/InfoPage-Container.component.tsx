import React from "react";
import { useTranslation } from "react-i18next";
import {
    table1,
    table2,
    table3a,
    table3b,
    table4,
    table5a,
    table5b,
    years2010To2021,
    years2016To2021,
} from "../components/AmrsTables.constants";
import { getMicroorgaNameAsString } from "../components/getMicroorgaName.service";
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
} from "../components/italicNames.constants";
import { AmrKey, AmrsTable } from "../model/ExplanationPage.model";
import { InfoPageComponent } from "./ExplanationMainComponent";

export function InfoPageContainerComponent(): JSX.Element {
    const { t } = useTranslation(["InfoPage"]);

    function modifyTableDataStringService(inputString: string): string {
        return `"${inputString.replace(/"/g, '\\"').replace("undefined", "")}"`;
    }

    const abInfo = [
        t("Methods.Amrs.TableHeaderShortSub"),
        t("Methods.Amrs.TableHeaderClass"),
        t("Methods.Amrs.TableHeaderSubstance"),
    ];
    const tableHeader2010To2021 = [
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
        t("samplingYear.2021"),
    ].reverse();
    const tableHeader2016To2021 = [
        t("samplingYear.2016"),
        t("samplingYear.2017"),
        t("samplingYear.2018"),
        t("samplingYear.2019"),
        t("samplingYear.2020"),
        t("samplingYear.2021"),
    ].reverse();

    const tableSubHeader2010To2020: Record<string, string[]> = {};

    for (const year of years2010To2021) {
        tableSubHeader2010To2020[year] = [
            t("Methods.Amrs.TableHeaderCutOff"),
            t("Methods.Amrs.TableHeaderMin"),
            t("Methods.Amrs.TableHeaderMax"),
        ];
    }

    const tableSubHeader2016To2020: Record<string, string[]> = {};
    for (const year of years2016To2021) {
        tableSubHeader2016To2020[year] = [
            t("Methods.Amrs.TableHeaderCutOff"),
            t("Methods.Amrs.TableHeaderMin"),
            t("Methods.Amrs.TableHeaderMax"),
        ];
    }

    const table1Coli: AmrsTable = {
        introduction: (
            <>
                {t(`Methods.Amrs.Table1.Paragraph.Description1`)}
                {coliShort}
                {t(`Methods.Amrs.Table1.Paragraph.Description2`)}
                {coliShort}
                {t(`Methods.Amrs.Table1.Paragraph.Description3`)}
            </>
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
        tableHeader: [...abInfo, ...tableHeader2010To2021],
        tableSubHeader: tableSubHeader2010To2020,
        tableRows: table1,
    };
    const table2Salm: AmrsTable = {
        introduction: (
            <>
                {t("Methods.Amrs.Table2.Paragraph.Description1")}
                {salmSpp}
                {t("Methods.Amrs.Table2.Paragraph.Description2")}
            </>
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
        tableHeader: [...abInfo, ...tableHeader2010To2021],
        tableSubHeader: tableSubHeader2010To2020,
        tableRows: table2,
    };
    const table3aCampy: AmrsTable = {
        introduction: (
            <>
                {t(`Methods.Amrs.Table3a.Paragraph.Description1`)}
                {campyJeShort}
                {t(`Methods.Amrs.Table3a.Paragraph.Description2`)}
                {campyColiShort}
                {t(`Methods.Amrs.Table3a.Paragraph.Description3`)}
            </>
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
        tableHeader: [...abInfo, ...tableHeader2010To2021],
        tableSubHeader: tableSubHeader2010To2020,
        tableRows: table3a,
    };
    const table3bCampy: AmrsTable = {
        introduction: <>{t(`Methods.Amrs.Table3b.Paragraph`)}</>,
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
        tableHeader: [...abInfo, ...tableHeader2010To2021],
        tableSubHeader: tableSubHeader2010To2020,
        tableRows: table3b,
    };
    const table4Mrsa: AmrsTable = {
        introduction: (
            <>
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
            </>
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
        tableHeader: [...abInfo, ...tableHeader2010To2021],
        tableSubHeader: tableSubHeader2010To2020,
        tableRows: table4,
    };
    const table5aEfaecalis: AmrsTable = {
        introduction: (
            <>
                {t(`Methods.Amrs.Table5a.Paragraph.Description1`)}
                {enteroFaecalis}
                {t(`Methods.Amrs.Table5a.Paragraph.Description3`)}
            </>
        ),
        title: (
            <div>
                {t("Methods.Amrs.Table5a.TableTitle.Part1")}
                {enteroFaecalis}
            </div>
        ),
        titleString: `${t(
            "Methods.Amrs.Table5a.TableTitle.Part1"
        )} ${getMicroorgaNameAsString("fullName", "EnteroFaecalis")}`,
        description: t("Methods.Amrs.Table5a.TableDescription"),
        tableHeader: [...abInfo, ...tableHeader2016To2021],
        tableSubHeader: tableSubHeader2016To2020,
        tableRows: table5a,
    };

    const table5bEfaecium: AmrsTable = {
        introduction: (
            <>
                {t(`Methods.Amrs.Table5b.Paragraph.Description1`)}
                {enteroFaecium}
                {t(`Methods.Amrs.Table5b.Paragraph.Description3`)}
            </>
        ),
        title: (
            <div>
                {t("Methods.Amrs.Table5b.TableTitle.Part1")}
                {enteroFaecium}
            </div>
        ),
        titleString: `${t(
            "Methods.Amrs.Table5b.TableTitle.Part1"
        )} ${getMicroorgaNameAsString("fullName", "EnteroFaecium")}`,
        description: t("Methods.Amrs.Table5b.TableDescription"),
        tableHeader: [...abInfo, ...tableHeader2016To2021],
        tableSubHeader: tableSubHeader2016To2020,
        tableRows: table5b,
    };

    const amrTableData: Record<AmrKey, AmrsTable> = {
        1: table1Coli,
        2: table2Salm,
        ["3a"]: table3aCampy,
        ["3b"]: table3bCampy,
        4: table4Mrsa,
        ["5a"]: table5aEfaecalis,
        ["5b"]: table5bEfaecium,
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
            tableData={amrTableData}
            onAmrDataExport={handleExportAmrData}
        />
    );
}
