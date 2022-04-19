import React from "react";
import { useTranslation } from "react-i18next";
import { Box, IconButton, Tooltip, useTheme } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";

/**
 * @desc Button and tooltip to clear all selected settings.
 * @param props - onclick to remove the selected values
 * @returns {JSX.Element} - button component with tooltip
 */
export function ClearSelectorComponent(props: {
    onClick: () => void;
    disabled: boolean;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);
    const theme = useTheme();
    const mouseOverText = t("QueryPage:Buttons.Delete");

    const handleClick = (): void => props.onClick();

    return (
        <Box sx={{ marginTop: "auto", display: "flex", alignItems: "center" }}>
            <Tooltip
                title={mouseOverText}
                placement="top"
                sx={{
                    backgroundColor: "transparent",
                    color: theme.palette.primary.contrastText,
                    fontSize: "9px",
                    margin: "0.2em",
                }}
            >
                <span>
                    <IconButton
                        sx={{
                            height: "fit-content",
                            padding: 0,
                            color: theme.palette.primary.main,
                        }}
                        onClick={handleClick}
                        disabled={props.disabled}
                        size="large"
                    >
                        <CancelIcon
                            sx={{
                                height: "20px",
                                width: "20px",
                            }}
                        />
                    </IconButton>
                </span>
            </Tooltip>
        </Box>
    );
}
