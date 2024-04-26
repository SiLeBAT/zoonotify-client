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
import React from "react";
import { useTranslation } from "react-i18next";
import { ZNAccordion } from "../../shared/components/accordion/ZNAccordion";
import {
    SearchParameters,
    usePrevalenceFilters,
} from "./PrevalenceDataContext";

interface PrevalenceMainContentProps {
    heading: string;
}

type SearchParameterDisplayProps = {
    searchParameters: SearchParameters;
};

type SearchParameterEntryProps = {
    title: string;
    value: string;
};

const SearchParameterEntry: React.FC<SearchParameterEntryProps> = ({
    title,
    value,
}) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                width: "100%",
            }}
        >
            <span style={{ fontWeight: "bold", paddingRight: "0.5em" }}>
                {title}:
            </span>
            <span>{value}</span>
        </Box>
    );
};

const SearchParameterDisplay: React.FC<SearchParameterDisplayProps> = ({
    searchParameters,
}) => {
    const theme = useTheme();
    const { t } = useTranslation(["PrevalencePage"]);
    return (
        <Box
            sx={{
                pt: theme.spacing(3),
                display: "flex",
                flexDirection: "row",
                width: "100%",
            }}
        >
            {searchParameters.microorganism ? (
                <SearchParameterEntry
                    title={t("MICROORGANISMS")}
                    value={searchParameters.microorganism
                        .map((v) => t(v))
                        .join(", ")}
                ></SearchParameterEntry>
            ) : null}
        </Box>
    );
};

const PrevalenceMainContent: React.FC<PrevalenceMainContentProps> = ({
    heading,
}) => {
    const theme = useTheme();
    const { searchParameters, prevalenceData, error, loading } =
        usePrevalenceFilters();

    const customPaperStyle = {
        margin: theme.spacing(3),
        overflowX: "auto",
        backgroundColor: theme.palette.background.paper,
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
            <Box
                sx={{
                    pt: theme.spacing(3),
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Box
                    sx={{
                        width: "80%",
                    }}
                >
                    <ZNAccordion
                        title="Parameter"
                        content={
                            <SearchParameterDisplay
                                searchParameters={searchParameters}
                            />
                        }
                        defaultExpanded={false}
                        centerContent={true}
                    />
                </Box>
            </Box>
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
                            <TableCell align="center">Matrix Detail</TableCell>
                            <TableCell align="center">Matrix Group</TableCell>
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
                            prevalenceData.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell align="center">
                                        {item.attributes.samplingYear}
                                    </TableCell>
                                    <TableCell align="center">
                                        {item.attributes.matrix?.attributes
                                            .name || "N/A"}
                                    </TableCell>
                                    <TableCell align="center">
                                        {item.attributes.matrixDetail
                                            ?.attributes.name || "N/A"}
                                    </TableCell>
                                    <TableCell align="center">
                                        {item.attributes.matrixGroup?.attributes
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
