import React from "react";
import { Box, Alert, Link } from "@mui/material";
import { useTheme } from "@mui/system";
import { useTranslation } from "react-i18next";
import { MainComponentHeader } from "../../shared/components/MainComponentHeader";
import { usePrevalenceFilters } from "./PrevalenceDataContext";
import { PrevalenceDataGrid } from "./PrevalenceDataGrid";
import { useFetchSupportEmail } from "../../shared/components/footer/Footer-Container.component";

const PrevalenceMainContent: React.FC<{ heading: string }> = ({ heading }) => {
    const { prevalenceData, loading, error, showError } =
        usePrevalenceFilters();

    const theme = useTheme();
    const { t, i18n } = useTranslation(["PrevalencePage"]);
    const supportMail = useFetchSupportEmail();

    const mailtoLink =
        supportMail && error
            ? `mailto:${supportMail}?subject=ZooNotify-Error-Report&body=${encodeURIComponent(
                  error
              )}`
            : "";

    return (
        <>
            <MainComponentHeader heading={heading} />
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
                        {t("errorPrefix")}{" "}
                        <Link href={mailtoLink}>{t("errorLinkText")}</Link>{" "}
                        {t("errorSuffix")}
                    </Alert>
                )}

                {/* ✅ ALWAYS render DataGrid component
                    - Before search: it shows only INFORMATION accordion
                    - After search: it shows table + chart + info */}
                <Box sx={{ width: "95%" }}>
                    <PrevalenceDataGrid
                        prevalenceData={prevalenceData}
                        loading={loading}
                        language={i18n.language.startsWith("de") ? "de" : "en"}
                    />
                </Box>
            </Box>
        </>
    );
};

export { PrevalenceMainContent };
