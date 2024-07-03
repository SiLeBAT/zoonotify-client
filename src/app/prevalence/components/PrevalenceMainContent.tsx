import { Box, Alert } from "@mui/material";
import { useTheme } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import { MainComponentHeader } from "../../shared/components/MainComponentHeader";
import { usePrevalenceFilters } from "./PrevalenceDataContext";
import { PrevalenceDataGrid } from "./PrevalenceDataGrid";

interface PrevalenceMainContentProps {
    heading: string;
}

const PrevalenceMainContent: React.FC<PrevalenceMainContentProps> = ({
    heading,
}) => {
    const { prevalenceData, loading, error } = usePrevalenceFilters();
    const theme = useTheme();
    const { t } = useTranslation(["PrevalencePage"]);

    return (
        <>
            <MainComponentHeader heading={heading}></MainComponentHeader>
            <Box
                sx={{
                    pt: theme.spacing(3),
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    height: "calc(100vh - 150px)",
                    overflow: "auto",

                    justifyContent: "flex-start",
                    padding: theme.spacing(2),
                }}
            >
                {error && (
                    <Alert severity="error">
                        {t("error notAllDataRetrieved")}{" "}
                        {/* Use the t function to translate the error message */}
                    </Alert>
                )}
                {prevalenceData.length > 0 ? (
                    <Box
                        sx={{
                            width: "95%",
                        }}
                    >
                        <PrevalenceDataGrid
                            prevalenceData={prevalenceData}
                            loading={loading}
                        ></PrevalenceDataGrid>
                    </Box>
                ) : null}
            </Box>
        </>
    );
};

export { PrevalenceMainContent };
