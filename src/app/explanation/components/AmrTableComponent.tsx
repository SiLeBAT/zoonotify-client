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

interface AntibioticData {
    "cut-off"?: number | string;
    min?: number | string;
    max?: number | string;
    Wirkstoff?: string;
    Substanzklasse?: string;
}

interface ResistanceTable {
    tableId: string;
    description: string;
    title: string;
    yearlyData: { [year: string]: { [antibiotic: string]: AntibioticData } };
    Wirkstoff: { [antibiotic: string]: string };
    Substanzklasse: { [antibiotic: string]: string };
}

interface AmrTableComponentProps {
    tableData: ResistanceTable;
}

const AmrTableComponent: React.FC<AmrTableComponentProps> = ({ tableData }) => {
    const [open, setOpen] = useState(false);
    const { title, yearlyData, Wirkstoff, Substanzklasse, description } =
        tableData;

    const years = Object.keys(yearlyData).sort((a, b) => b.localeCompare(a));
    const antibiotics = Object.keys(yearlyData[years[0]] || {});

    const headerCellStyle = { fontWeight: "bold", backgroundColor: "#f0f0f0" };
    const subHeaderCellStyle = {
        fontWeight: "bold",
        backgroundColor: "#e0e0e0",
    };

    // Styles for the title box
    const titleBoxStyle = {
        display: "inline-block",
        padding: "4px 8px",
        margin: "4px 0",
        backgroundColor: "#f0f0f0",
        border: "1px solid #ccc",
        borderRadius: "4px",
        cursor: "pointer",
        transition: "background-color 0.3s",
        // When hovered, we'll change the background color
        "&:hover": {
            backgroundColor: "#e0e0e0",
        },
    };

    return (
        <div style={{ margin: "0 auto", maxWidth: "90%" }}>
            <div
                style={titleBoxStyle}
                onClick={() => setOpen(true)}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#e0e0e0")
                }
                onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f0f0f0")
                }
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
                            aria-label="antibiotic-resistance-table"
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell style={headerCellStyle}>
                                        Antibiotic
                                    </TableCell>
                                    <TableCell style={headerCellStyle}>
                                        Wirkstoff
                                    </TableCell>
                                    <TableCell style={headerCellStyle}>
                                        Substanzklasse
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
                                                Min
                                            </TableCell>
                                            <TableCell
                                                style={subHeaderCellStyle}
                                                align="center"
                                            >
                                                Max
                                            </TableCell>
                                            <TableCell
                                                style={subHeaderCellStyle}
                                                align="center"
                                            >
                                                Cut-off
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
                                            {Wirkstoff[antibiotic] || "_"}
                                        </TableCell>
                                        <TableCell>
                                            {Substanzklasse[antibiotic] || "_"}
                                        </TableCell>
                                        {years.map((year) => {
                                            const data =
                                                yearlyData[year][antibiotic] ||
                                                {};
                                            return (
                                                <React.Fragment key={year}>
                                                    <TableCell align="right">
                                                        {data.min || "_"}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {data.max || "_"}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {data["cut-off"] || "_"}
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
