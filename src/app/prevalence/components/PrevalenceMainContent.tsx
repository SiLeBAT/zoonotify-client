import React from "react";
import { Box, Alert, Link } from "@mui/material";
import { useTheme } from "@mui/system";
import { useTranslation } from "react-i18next";
import { MainComponentHeader } from "../../shared/components/MainComponentHeader";
import { usePrevalenceFilters } from "./PrevalenceDataContext";
import { PrevalenceDataGrid } from "./PrevalenceDataGrid";
import { useFetchSupportEmail } from "../../shared/components/footer/Footer-Container.component";

interface PrevalenceMainContentProps {
    heading: string;
}

const PrevalenceMainContent: React.FC<PrevalenceMainContentProps> = ({
    heading,
}) => {
    const { prevalenceData, loading, error, showError } =
        usePrevalenceFilters();
    const theme = useTheme();
    const { t } = useTranslation(["PrevalencePage"]);
    const supportMail = useFetchSupportEmail();

    const mailtoLink =
        supportMail && error
            ? `mailto:${supportMail}?subject=ZooNotify-Error-Report&body=${encodeURIComponent(
                  error
              )}`
            : "";

    // Extracting the message and explicitly making "zoonotify support" a link
    const errorMessage = t("error notAllDataRetrieved");
    const beforeLink = errorMessage.split("zoonotify support")[0];
    const afterLink = errorMessage.split("zoonotify support")[1];

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
                {showError && error && supportMail && (
                    <Alert severity="error">
                        {beforeLink}
                        <Link href={mailtoLink}>zoonotify support</Link>
                        {afterLink}
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
