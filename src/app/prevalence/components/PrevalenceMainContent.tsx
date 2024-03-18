import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/system";
import React from "react";
import { usePrevalenceFilters } from "./PrevalenceDataContext";

interface PrevalenceMainContentProps {
    heading: string;
}

export function PrevalenceMainContent({
    heading,
}: PrevalenceMainContentProps): JSX.Element {
    const theme = useTheme();
    const { selectedMicroorganisms, selectedAnimalSpecies } =
        usePrevalenceFilters();

    return (
        <Box
            sx={{
                pt: theme.spacing(3),
                display: "flex",
                flexDirection: "column",
                overflowY: "auto", // Scrollable area for the main content
                height: "calc(100vh - 64px)",
                width: "100%",
            }}
        >
            <Typography
                variant="h1"
                sx={{
                    pb: theme.spacing(0.5),
                    fontSize: "3rem",
                    textAlign: "center",
                    fontWeight: "normal",
                    color: theme.palette.primary.main,
                    borderBottom: `1px solid ${theme.palette.primary.main}`,
                }}
            >
                {heading}
            </Typography>
            <Typography
                variant="h6"
                sx={{
                    textAlign: "center",
                    my: theme.spacing(2),
                    fontWeight: "bold",
                    fontSize: "2rem",
                    color: theme.palette.primary.dark,
                }}
            >
                Table
            </Typography>
            <Box
                sx={{
                    maxWidth: "70%",
                    mx: "auto",
                }}
            >
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
                        tableLayout: "fixed",
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
            </Box>
        </Box>
    );
}
