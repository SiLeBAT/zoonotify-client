import { Box } from "@mui/material";
// eslint-disable-next-line import/named
import { useTheme } from "@mui/system";
import React from "react";
import { MainComponentHeader } from "../../shared/components/MainComponentHeader";
import { usePrevalenceFilters } from "./PrevalenceDataContext";
import { PrevalenceDataGrid } from "./PrevalenceDataGrid";
interface PrevalenceMainContentProps {
    heading: string;
}

const PrevalenceMainContent: React.FC<PrevalenceMainContentProps> = ({
    heading,
}) => {
    const { prevalenceData, loading } = usePrevalenceFilters();
    const theme = useTheme();

    return (
        <>
            <MainComponentHeader heading={heading}></MainComponentHeader>
            <Box
                sx={{
                    pt: theme.spacing(3),
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {prevalenceData.length > 0 ? (
                    <Box
                        sx={{
                            width: "80%",
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
