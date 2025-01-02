import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
} from "@mui/material";
import Markdown from "markdown-to-jsx";
import { useTranslation } from "react-i18next";

export interface AntibioticData {
    "cut-off"?: number | string;
    min?: number | string;
    max?: number | string;

    Substanzklasse?: string;
    Wirkstoff?: string;
}

export interface ResistanceTable {
    tableId: string;
    description: string;
    title: string;
    yearlyData: { [year: string]: { [antibiotic: string]: AntibioticData } };

    Substanzklasse: { [antibiotic: string]: string };
    Wirkstoff: { [antibiotic: string]: string };
}

interface AmrTableComponentProps {
    tableData: ResistanceTable;
}
export interface ApiData {
    id: number;
    attributes: {
        table_id: string;
        description: string;
        yearly_cut_off: {
            [year: string]: {
                [antibiotic: string]: AntibioticData;
            }[];
        };
        title: string;
    };
}
const AmrTableComponent: React.FC<AmrTableComponentProps> = ({ tableData }) => {
    const [open, setOpen] = useState(false);
    const { t } = useTranslation(); // Initialize the translation function
    const { title, yearlyData, Substanzklasse, Wirkstoff, description } =
        tableData;

    const years = Object.keys(yearlyData).sort((a, b) => b.localeCompare(a));

    const antibiotics = Object.keys(yearlyData[years[0]] || {});

    const headerCellStyle = { fontWeight: "bold", backgroundColor: "#f0f0f0" };
    const subHeaderCellStyle = {
        fontWeight: "bold",
        backgroundColor: "#e0e0e0",
    };

    return (
        <div style={{ margin: "0 auto", maxWidth: "90%" }}>
            <div
                style={{
                    display: "inline-block",
                    padding: "4px 8px",
                    margin: "4px 0",
                    backgroundColor: "#f0f0f0",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                    transition: "background-color 0.3s",
                }}
                onClick={() => setOpen(true)}
            >
                <Markdown>{title}</Markdown>
            </div>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>
                    <Markdown>{title}</Markdown>
                </DialogTitle>
                <DialogContent>
                    <div dangerouslySetInnerHTML={{ __html: description }} />
                    <TableContainer component={Paper}>
                        <Table
                            size="small"
                            aria-label={t("antibiotic-resistance-table")}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell style={headerCellStyle}>
                                        {t("Antibiotic")}
                                    </TableCell>

                                    <TableCell style={headerCellStyle}>
                                        {t("Wirkstoff")}
                                    </TableCell>

                                    <TableCell style={headerCellStyle}>
                                        {t("Substanzklasse")}
                                    </TableCell>

                                    {years.map((year) => (
                                        <React.Fragment key={year}>
                                            <TableCell
                                                style={headerCellStyle}
                                                align="center"
                                                colSpan={3}
                                            >
                                                {year}
                                            </TableCell>
                                        </React.Fragment>
                                    ))}
                                </TableRow>
                                <TableRow>
                                    <TableCell
                                        style={subHeaderCellStyle}
                                    ></TableCell>
                                    <TableCell
                                        style={subHeaderCellStyle}
                                    ></TableCell>
                                    <TableCell
                                        style={subHeaderCellStyle}
                                    ></TableCell>
                                    {years.map((year) => (
                                        <React.Fragment key={year}>
                                            <TableCell
                                                style={subHeaderCellStyle}
                                                align="center"
                                            >
                                                {t("Cut-off")}
                                            </TableCell>

                                            <TableCell
                                                style={subHeaderCellStyle}
                                                align="center"
                                            >
                                                {t("Max")}
                                            </TableCell>
                                            <TableCell
                                                style={subHeaderCellStyle}
                                                align="center"
                                            >
                                                {t("Min")}
                                            </TableCell>
                                        </React.Fragment>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {antibiotics.map((antibiotic) => (
                                    <TableRow key={antibiotic}>
                                        <TableCell>{antibiotic}</TableCell>
                                        <TableCell>
                                            {Substanzklasse[antibiotic]}
                                        </TableCell>
                                        <TableCell>
                                            {Wirkstoff[antibiotic]}
                                        </TableCell>
                                        {years.map((year) => {
                                            const data: AntibioticData =
                                                yearlyData[year][antibiotic] ||
                                                {};
                                            return (
                                                <React.Fragment key={year}>
                                                    <TableCell align="right">
                                                        {data.min}
                                                    </TableCell>

                                                    <TableCell align="right">
                                                        {data.max}
                                                    </TableCell>

                                                    <TableCell align="right">
                                                        {data["cut-off"]}
                                                    </TableCell>
                                                </React.Fragment>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export { AmrTableComponent };
