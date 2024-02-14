import React from "react";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/system";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useSelection } from "./SelectionContext"; // Make sure the path to SelectionContext.js is correct
interface PrevalenceMainContentProps {
    heading: string;
}
export function PrevalenceMainContent({
    heading,
}: PrevalenceMainContentProps): JSX.Element {
    const theme = useTheme();
    const { selectedMicroorganisms, selectedAnimalSpecies } = useSelection();

    return (
        <div
            style={{
                padding: theme.spacing(3),
                display: "flex",
                justifyContent: "center",
                width: "100%",
            }}
        >
            <div style={{ maxWidth: "70%" }}>
                {" "}
                {/* Wrapper for content to be centered */}
                <Typography
                    variant="h1"
                    sx={{
                        paddingBottom: "0.5em",
                        fontSize: "3rem",
                        textAlign: "center",
                        fontWeight: "normal",
                        color: theme.palette.primary.main,
                        borderBottom: `1px solid ${theme.palette.primary.main}`,
                    }}
                >
                    {heading}
                </Typography>
                {/* Table Title aligned to the right */}
                <Typography
                    variant="h6"
                    sx={{
                        textAlign: "left",
                        margin: theme.spacing(2, 0),
                        fontWeight: "bold",
                        fontSize: "2rem",
                        color: theme.palette.primary.dark,
                    }}
                >
                    Table
                </Typography>
                {/* Table Component */}
                <Table
                    size="small"
                    sx={{
                        "& thead th": {
                            fontWeight: "bold",
                            backgroundColor: theme.palette.primary.light,
                            color: theme.palette.common.white,
                            border: 2,
                            borderColor: theme.palette.divider,
                            padding: theme.spacing(2),
                        },
                        "& tbody td": {
                            border: 1,
                            borderColor: theme.palette.divider,
                            padding: theme.spacing(1),
                        },
                        "& tbody tr:hover": {
                            backgroundColor: theme.palette.action.hover,
                        },
                        tableLayout: "fixed", // Ensures fixed column widths
                    }}
                    aria-label="selections table"
                >
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">Microorganism</TableCell>
                            <TableCell align="center">Animal Species</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {selectedMicroorganisms.map((microorganism, index) => (
                            <TableRow key={microorganism}>
                                <TableCell align="center">
                                    {microorganism}
                                </TableCell>
                                <TableCell align="center">
                                    {selectedAnimalSpecies[index] || ""}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
