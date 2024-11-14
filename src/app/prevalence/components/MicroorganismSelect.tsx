import React from "react";
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { FormattedMicroorganismName } from "./FormattedMicroorganismName";

interface MicroorganismSelectProps {
    currentMicroorganism: string | null;
    availableMicroorganisms: string[];
    setCurrentMicroorganism: (microorganism: string) => void;
}

const MicroorganismSelect: React.FC<MicroorganismSelectProps> = ({
    currentMicroorganism,
    availableMicroorganisms,
    setCurrentMicroorganism,
}) => {
    const { t } = useTranslation(["PrevalencePage"]);

    return (
        <FormControl fullWidth sx={{ mb: 1 }} variant="outlined">
            <InputLabel id="microorganism-select-label" shrink={true}>
                {t("Select_Microorganism")}
            </InputLabel>
            <Select
                labelId="microorganism-select-label"
                value={currentMicroorganism || ""}
                onChange={(event) =>
                    setCurrentMicroorganism(event.target.value as string)
                }
                label={t("Select_Microorganism")}
                sx={{ backgroundColor: "#f5f5f5" }}
                renderValue={(selected) => (
                    <FormattedMicroorganismName microName={selected} />
                )}
            >
                {availableMicroorganisms.length > 0 ? (
                    availableMicroorganisms.map((microorganism) => (
                        <MenuItem key={microorganism} value={microorganism}>
                            <FormattedMicroorganismName
                                microName={microorganism}
                            />
                        </MenuItem>
                    ))
                ) : (
                    <MenuItem disabled>
                        <Typography component="span">
                            {t("No_Microorganisms_Available")}
                        </Typography>
                    </MenuItem>
                )}
            </Select>
        </FormControl>
    );
};

// Export as a named export
export { MicroorganismSelect };
