import { Box } from "@mui/material";
import { useTheme } from "@mui/system";
// eslint-disable-next-line import/named
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
