import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";
import { ZNAccordion } from "../../shared/components/accordion/ZNAccordion";
import {
    SearchParameters,
    usePrevalenceFilters,
} from "./PrevalenceDataContext";

interface DataGridControlsProps {
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
    if (!value) return null; // Do not render anything if the value is empty

    const theme = useTheme();

    return (
        <Box
            sx={{
                p: 1,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                mb: 1,
                backgroundColor: theme.palette.grey[100],
                width: "100%",

                maxWidth: "1200px",
            }}
        >
            <Typography
                variant="subtitle1"
                sx={{
                    fontWeight: "bold",
                    mr: 1,
                    color: theme.palette.text.primary,
                    display: "inline",
                }}
            >
                {title}:
            </Typography>
            <Typography
                variant="body2"
                sx={{
                    color: theme.palette.text.primary,
                    display: "inline",
                }}
            >
                {value}
            </Typography>
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
                flexDirection: "column",
                width: "100%",
            }}
        >
            {searchParameters.microorganism && (
                <SearchParameterEntry
                    title={t("MICROORGANISMS")}
                    value={searchParameters.microorganism
                        .map((v) => t(v))
                        .join(", ")}
                />
            )}
            {searchParameters.matrix && (
                <SearchParameterEntry
                    title={t("MATRIX")}
                    value={searchParameters.matrix.map((v) => t(v)).join(", ")}
                />
            )}
            {searchParameters.sampleOrigin && (
                <SearchParameterEntry
                    title={t("SAMPLE_ORIGIN")}
                    value={searchParameters.sampleOrigin
                        .map((v) => t(v))
                        .join(", ")}
                />
            )}
            {searchParameters.matrixGroup && (
                <SearchParameterEntry
                    title={t("MATRIX_GROUP")}
                    value={searchParameters.matrixGroup
                        .map((v) => t(v))
                        .join(", ")}
                />
            )}
            {searchParameters.samplingYear && (
                <SearchParameterEntry
                    title={t("SAMPLING_YEAR")}
                    value={searchParameters.samplingYear
                        .map((v) => t(v))
                        .join(", ")}
                />
            )}
            {searchParameters.superCategorySampleOrigin && (
                <SearchParameterEntry
                    title={t("SUPER-CATEGORY-SAMPLE-ORIGIN")}
                    value={searchParameters.superCategorySampleOrigin
                        .map((v) => t(v))
                        .join(", ")}
                />
            )}
            {searchParameters.samplingStage && (
                <SearchParameterEntry
                    title={t("SAMPLING_STAGE")}
                    value={searchParameters.samplingStage
                        .map((v) => t(v))
                        .join(", ")}
                />
            )}
        </Box>
    );
};

const DataGridControls: React.FC<DataGridControlsProps> = ({ heading }) => {
    const { searchParameters } = usePrevalenceFilters();
    return (
        <ZNAccordion
            title={heading}
            content={
                <SearchParameterDisplay searchParameters={searchParameters} />
            }
            defaultExpanded={false}
            centerContent={true}
        />
    );
};

export { DataGridControls };
