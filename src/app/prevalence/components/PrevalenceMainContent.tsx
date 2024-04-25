import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { useTheme } from "@mui/system";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { usePrevalenceFilters } from "./PrevalenceDataContext";

interface RelationalData {
    id: number;
    attributes: {
        name: string;
    };
}

interface PrevalenceAttributes {
    samplingYear: number;
    numberOfSamples: number;
    numberOfPositive: number;
    percentageOfPositive: number;
    ciMin: number;
    ciMax: number;
    matrix?: RelationalData;
    microorganism?: RelationalData;
}

interface PrevalenceDataItem {
    id: number;
    attributes: PrevalenceAttributes;
}

interface PrevalenceMainContentProps {
    heading: string;
}

const PrevalenceMainContent: React.FC<PrevalenceMainContentProps> = ({
    heading,
}) => {
    const theme = useTheme();
    const { selectedMicroorganisms } = usePrevalenceFilters(); // Assumed to be an array of selected microorganism names (strings)
    const [data, setData] = useState<PrevalenceDataItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        const fetchData = async (
            microorganismName: string
        ): Promise<PrevalenceDataItem[]> => {
            let allData: PrevalenceDataItem[] = []; // Define the type of allData
            const pageSize = 100; // or the maximum allowed by your API
            let page = 0;

            try {
                // Keep fetching data until all pages have been fetched
                while (true) {
                    const response = await axios.get(
                        `http://localhost:1337/api/prevalences`,
                        {
                            params: {
                                populate: "*",
                                "filters[microorganism][name][$eq]":
                                    microorganismName,
                                "pagination[start]": page * pageSize,
                                "pagination[limit]": pageSize,
                            },
                        }
                    );

                    const incomingData: PrevalenceDataItem[] =
                        response.data.data; // Cast the response data to the correct type
                    allData = allData.concat(incomingData);

                    // Break the loop if the last page has fewer items than the page size
                    if (incomingData.length < pageSize) {
                        break;
                    }

                    page++;
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                console.error("Error fetching data:", err);
                setError(
                    err.message || "An error occurred while fetching data."
                );
            }

            return allData;
        };

        const aryOfPromises = selectedMicroorganisms.map(fetchData);
        // eslint-disable-next-line promise/catch-or-return
        Promise.all(aryOfPromises)
            .then((results) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const aggregatedData = results.flat().map((item: any) => ({
                    id: item.id,
                    attributes: {
                        ...item.attributes,
                        matrix: item.attributes.matrix?.data,
                        microorganism: item.attributes.microorganism?.data,
                        sampleOrigin: item.attributes.sampleOrigin?.data,
                    },
                }));
                setData(aggregatedData);
                return aggregatedData;
            })
            .catch((err) => {
                setError(err.message);
                console.error("Error setting data:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [selectedMicroorganisms]);

    const customPaperStyle = {
        margin: theme.spacing(3),
        overflowX: "auto",
        backgroundColor: theme.palette.background.paper, // use theme paper color
    };

    return (
        <Box
            sx={{
                pt: theme.spacing(3),
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
                height: "calc(100vh - 130px)",
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
                    my: theme.spacing(3),
                    fontWeight: "bold",
                    fontSize: "2rem",
                    color: theme.palette.primary.dark,
                    textAlign: "center",
                }}
            >
                Prevalence Table
            </Typography>

            <Paper sx={customPaperStyle}>
                <Table
                    size="small"
                    sx={{
                        "& thead th": {
                            fontWeight: "bold",
                            backgroundColor: theme.palette.primary.light,
                            color: theme.palette.common.white,
                            border: 2,
                            borderColor: theme.palette.divider,
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
                        width: "100%", // ensure the table fills the paper container
                    }}
                    aria-label="selections table"
                >
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">Sampling Year</TableCell>
                            <TableCell align="center">Matrix</TableCell>
                            <TableCell align="center">Microorganism</TableCell>
                            <TableCell align="center">
                                Number of Samples
                            </TableCell>
                            <TableCell align="center">
                                Number of Positive
                            </TableCell>
                            <TableCell align="center">
                                Percentage of Positive
                            </TableCell>
                            <TableCell align="center">CI Min</TableCell>
                            <TableCell align="center">CI Max</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell align="center" colSpan={9}>
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell align="center" colSpan={9}>
                                    Error: {error}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell align="center">
                                        {item.attributes.samplingYear}
                                    </TableCell>
                                    <TableCell align="center">
                                        {item.attributes.matrix?.attributes
                                            .name || "N/A"}
                                    </TableCell>
                                    <TableCell align="center">
                                        {item.attributes.microorganism
                                            ?.attributes.name || "N/A"}
                                    </TableCell>
                                    <TableCell align="center">
                                        {item.attributes.numberOfSamples}
                                    </TableCell>
                                    <TableCell align="center">
                                        {item.attributes.numberOfPositive}
                                    </TableCell>
                                    <TableCell align="center">{`${item.attributes.percentageOfPositive.toFixed(
                                        2
                                    )}%`}</TableCell>
                                    <TableCell align="center">
                                        {item.attributes.ciMin?.toFixed(2) ||
                                            "N/A"}
                                    </TableCell>
                                    <TableCell align="center">
                                        {item.attributes.ciMax?.toFixed(2) ||
                                            "N/A"}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
};

export { PrevalenceMainContent };
