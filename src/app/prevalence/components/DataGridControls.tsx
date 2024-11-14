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
    value: JSX.Element | string;
};

const italicWords: string[] = [
    "Salmonella",
    "coli",
    "E.",
    "Bacillus",
    "cereus",
    "monocytogenes",
    "Clostridioides",
    "difficile",
    "Yersinia",
    "Listeria",
    "enterocolitica",
    "Vibrio",
    "Baylisascaris",
    "procyonis",
    "Echinococcus",
    "Campylobacter",
];

// Function to format microorganism names
const formatMicroorganismName = (
    microName: string | null | undefined
): JSX.Element => {
    if (!microName) {
        console.warn("Received null or undefined microorganism name");
        return <></>;
    }

    // Split by space and dash while preserving the separators
    const words = microName
        .split(/([-\s])/)
        .filter((part: string) => part.length > 0);

    return (
        <>
            {words.map((word: string, index: number) => {
                // If the word is just a separator (space or dash), return it as is
                if (word.trim() === "" || word === "-") {
                    return word;
                }

                const italic = italicWords.some((italicWord: string) =>
                    word.toLowerCase().includes(italicWord.toLowerCase())
                );

                return italic ? (
                    <i key={index}>{word}</i>
                ) : (
                    <span key={index}>{word}</span>
                );
            })}
        </>
    );
};

const SearchParameterEntry: React.FC<SearchParameterEntryProps> = ({
    title,
    value,
}) => {
    if (!value) return null;

    const theme = useTheme();

    return (
        <Box
            sx={{
                p: 1,
                border: 1,
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
            {/* Microorganism Display with correct formatting */}
            {searchParameters.microorganism?.length > 0 && (
                <SearchParameterEntry
                    title={t("MICROORGANISMS")}
                    value={
                        <>
                            {searchParameters.microorganism.map((v, index) => (
                                <span key={index}>
                                    {formatMicroorganismName(t(v))}
                                    {index <
                                    searchParameters.microorganism.length - 1
                                        ? ", "
                                        : ""}
                                </span>
                            ))}
                        </>
                    }
                />
            )}
            {/* Other entries with length checks */}
            {searchParameters.matrix?.length > 0 && (
                <SearchParameterEntry
                    title={t("MATRIX")}
                    value={searchParameters.matrix.map((v) => t(v)).join(", ")}
                />
            )}
            {searchParameters.sampleOrigin?.length > 0 && (
                <SearchParameterEntry
                    title={t("SAMPLE_ORIGIN")}
                    value={searchParameters.sampleOrigin
                        .map((v) => t(v))
                        .join(", ")}
                />
            )}
            {searchParameters.matrixGroup?.length > 0 && (
                <SearchParameterEntry
                    title={t("MATRIX_GROUP")}
                    value={searchParameters.matrixGroup
                        .map((v) => t(v))
                        .join(", ")}
                />
            )}
            {searchParameters.samplingYear?.length > 0 && (
                <SearchParameterEntry
                    title={t("SAMPLING_YEAR")}
                    value={searchParameters.samplingYear
                        .map((v) => t(v))
                        .join(", ")}
                />
            )}
            {searchParameters.superCategorySampleOrigin?.length > 0 && (
                <SearchParameterEntry
                    title={t("SUPER-CATEGORY-SAMPLE-ORIGIN")}
                    value={searchParameters.superCategorySampleOrigin
                        .map((v) => t(v))
                        .join(", ")}
                />
            )}
            {searchParameters.samplingStage?.length > 0 && (
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
            defaultExpanded={true}
            centerContent={true}
        />
    );
};

export { DataGridControls };
