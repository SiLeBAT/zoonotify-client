import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import JSZip from "jszip";
import {
    DialogButton,
    DialogComponent,
} from "../../shared/components/dialog/Dialog.component";
import { AmrsTable, AmrsTableData } from "../model/ExplanationPage.model";

const tableTextStyle = {
    fontSize: "0.75rem",
    letterSpacing: "0",
    whiteSpace: "nowrap",
} as const;

// === Export helpers (INLINE, no new file) ===

function getFormattedTimestamp(): string {
    const d = new Date();
    return d
        .toISOString()
        .replace(/:/g, "-")
        .replace(/\..+/, "")
        .replace("T", "_");
}

function generateAmrTableCSV(
    rows: AmrsTableData[],
    years: string[],
    sep: "," | ";",
    decimalSep: "." | ",",
    t: (key: string) => string
): string {
    if (!rows || !rows.length) return "";

    // Headers with translation support
    const headers = [
        t("Short Substance"),
        t("Substance Class"),
        t("Wirkstoff"),
        ...years.flatMap((year) => [
            `${t("Max")} (${year})`,
            `${t("Min")} (${year})`,
            `${t("CutOff")} (${year})`,
        ]),
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function valueStr(val: any): string {
        if (val === null || val === undefined) return "";
        let str = String(val);
        if (typeof val === "number" && decimalSep === ",") {
            str = str.replace(".", ",");
        }
        // Escape if separator, quotes, or linebreaks
        if (str.includes(sep) || str.includes('"') || str.includes("\n")) {
            str = `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }

    const csvRows = [
        headers.join(sep),
        ...rows.map((row) => {
            const baseCells = [
                valueStr(row.shortSubstance),
                valueStr(row.substanceClass),
                valueStr(row.wirkstoff),
            ];
            const yearCells = years.flatMap((year) => {
                const yearObj = row.concentrationList[year] || {};
                return [
                    valueStr(yearObj.max),
                    valueStr(yearObj.min),
                    valueStr(yearObj.cutOff),
                ];
            });
            return [...baseCells, ...yearCells].join(sep);
        }),
    ];
    return csvRows.join("\n");
}

async function downloadAmrTableZip(
    rows: AmrsTableData[],
    years: string[],
    t: (key: string) => string
): Promise<void> {
    const timestamp = getFormattedTimestamp();
    const zip = new JSZip();

    const csvComma = generateAmrTableCSV(rows, years, ",", ".", t);
    const csvDot = generateAmrTableCSV(rows, years, ";", ",", t);

    zip.file(`amr_table_comma_${timestamp}.csv`, csvComma);
    zip.file(`amr_table_dot_${timestamp}.csv`, csvDot);

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `amr_table_${timestamp}.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// === End Export helpers ===

function createTableRowCells(row: AmrsTableData): JSX.Element[] {
    const tableCellList: JSX.Element[] = [];

    tableCellList.push(
        <TableCell
            sx={tableTextStyle}
            component="td"
            scope="row"
            key={`amr-table-cell-${row.amrSubstance}-short`}
        >
            {row.shortSubstance}
        </TableCell>,
        <TableCell
            sx={tableTextStyle}
            component="td"
            scope="row"
            key={`amr-table-cell-${row.amrSubstance}-substanceClass`}
        >
            {row.substanceClass}
        </TableCell>,
        <TableCell
            sx={tableTextStyle}
            component="td"
            scope="row"
            key={`amr-table-cell-${row.amrSubstance}-wirkstoff`}
        >
            {row.wirkstoff}
        </TableCell>
    );

    // **Sort the years descending before rendering**
    const sortedYears = Object.keys(row.concentrationList).sort(
        (a, b) => parseInt(b) - parseInt(a)
    );

    // Render the data for each year in descending order
    for (const year of sortedYears) {
        const concentrationPerYear = row.concentrationList[year];
        tableCellList.push(
            <TableCell
                sx={tableTextStyle}
                component="td"
                scope="row"
                align="right"
                key={`amr-table-cell-${row.amrSubstance}-${year}-max`}
            >
                {concentrationPerYear.max}
            </TableCell>,
            <TableCell
                sx={tableTextStyle}
                component="td"
                scope="row"
                align="right"
                key={`amr-table-cell-${row.amrSubstance}-${year}-min`}
            >
                {concentrationPerYear.min}
            </TableCell>,
            <TableCell
                sx={tableTextStyle}
                component="td"
                scope="row"
                align="right"
                key={`amr-table-cell-${row.amrSubstance}-${year}-cutOff`}
            >
                {concentrationPerYear.cutOff}
            </TableCell>
        );
    }

    return tableCellList;
}

export function InfoPageAmrDialogComponent(props: {
    resistancesTableData: AmrsTable;
    onClose: () => void;
}): JSX.Element {
    const { t } = useTranslation(["InfoPage"]);
    //console.log("DOWNLOAD_ZIP_FILE", t("DOWNLOAD_ZIP_FILE"));
    //console.log("InfoPageAmrDialogComponent file loaded");

    const handleClose = (): void => {
        props.onClose();
    };

    // Get all unique years (sorted descending)
    const yearsSet = new Set<string>();
    props.resistancesTableData.tableRows.forEach((row) => {
        Object.keys(row.concentrationList).forEach((year) =>
            yearsSet.add(year)
        );
    });
    const allYears = Array.from(yearsSet).sort(
        (a, b) => parseInt(b) - parseInt(a)
    );

    const handleExport = async (): Promise<void> => {
        await downloadAmrTableZip(
            props.resistancesTableData.tableRows,
            allYears,
            t
        );
    };

    const tableSubHeader: JSX.Element[] = [];

    for (const subHeaderKey of Object.keys(
        props.resistancesTableData.tableSubHeader
    )) {
        props.resistancesTableData.tableSubHeader[subHeaderKey].forEach(
            (subHeaderValue: string) => {
                tableSubHeader.push(
                    <TableCell
                        key={`subheader-amr-${subHeaderKey}-${subHeaderValue}`}
                        sx={tableTextStyle}
                        component="th"
                        align="right"
                    >
                        {subHeaderValue}
                    </TableCell>
                );
            }
        );
    }

    const nrOfSubstanceHeaderCells = 3;
    const substanceTableHeader = [];
    const spacingCells = [];

    for (let i = 0; i < nrOfSubstanceHeaderCells; i += 1) {
        substanceTableHeader.push(
            <TableCell
                key={`header-amr-${props.resistancesTableData.tableHeader[i]}`}
                sx={tableTextStyle}
                component="th"
                colSpan={1}
            >
                {props.resistancesTableData.tableHeader[i]}
            </TableCell>
        );
        spacingCells.push(
            <TableCell
                key={`header-amr-emptyCell-class-${i}`}
                sx={tableTextStyle}
                component="th"
                align="right"
            >
                &nbsp;
            </TableCell>
        );
    }

    const dialogTableContent = (
        <TableContainer
            sx={{
                maxWidth: "100%",
                width: "auto",
                height: "inherit",
                overflowY: "auto",
            }}
            component={Paper}
        >
            <Table size="small" stickyHeader aria-label="amr-table">
                <TableHead>
                    <TableRow>
                        {substanceTableHeader}
                        {props.resistancesTableData.tableHeader
                            .slice(nrOfSubstanceHeaderCells)
                            .map((headerValue) => (
                                <TableCell
                                    key={`header-amr-${headerValue}`}
                                    css={tableTextStyle}
                                    component="th"
                                    colSpan={3}
                                    align="center"
                                >
                                    {headerValue}
                                </TableCell>
                            ))}
                    </TableRow>
                    <TableRow>
                        {spacingCells}
                        {tableSubHeader}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.resistancesTableData.tableRows.map((row) => (
                        <TableRow key={`amr-table-row-${row.amrSubstance}`}>
                            {createTableRowCells(row)}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    // === BUTTONS (now with Export + Cancel) ===

    const amrTableExportButton: DialogButton = {
        content: t("DOWNLOAD_ZIP_FILE"),
        onClick: handleExport,
    };
    console.log(t("DOWNLOAD_ZIP_FILE"));
    const amrTableCancelButton: DialogButton = {
        content: t("Methods.Amrs.CancelButton") || "Close",
        onClick: handleClose,
    };

    return DialogComponent({
        loading: false,
        dialogTitle: props.resistancesTableData.title,
        dialogContentText: props.resistancesTableData.description,
        dialogContent: dialogTableContent,
        cancelButton: amrTableCancelButton,
        submitButton: amrTableExportButton, // <<--- Export is the main action, Cancel closes
    });
}
