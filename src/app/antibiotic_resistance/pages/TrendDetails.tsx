import React from "react";
import { useTranslation } from "react-i18next";
import { Button, Typography } from "@mui/material";
import { FormattedMicroorganismName } from "./AntibioticResistancePage.component";

interface TrendDetailsProps {
    microorganism: string;
    onBack: () => void;
}

export const TrendDetails: React.FC<TrendDetailsProps> = ({
    microorganism,
    onBack,
}) => {
    const { t } = useTranslation(["Antibiotic"]);

    return (
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            {/* Breadcrumb navigation */}
            <div style={{ marginBottom: "2rem" }}>
                <Typography
                    component="span"
                    style={{
                        fontSize: "1.75rem",
                        color: "#003663",
                    }}
                >
                    {t("AntibioticResistance")} /{" "}
                    <FormattedMicroorganismName
                        microName={microorganism}
                        isBreadcrumb={true}
                    />{" "}
                    / {t("Trend")}
                </Typography>
            </div>

            <Button
                onClick={onBack}
                variant="contained"
                style={{
                    marginBottom: "2rem",
                    backgroundColor: "#003663",
                    color: "#fff",
                }}
            >
                {t("Back")}
            </Button>
        </div>
    );
};
