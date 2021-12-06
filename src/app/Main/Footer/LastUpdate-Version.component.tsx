import React from "react";
import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { useTheme } from "@mui/system";

export interface VersionProps {
    text: string;
}

/**
 * @desc Returns one ListItem for one version
 * @param props
 * @returns {JSX.Element} - listItem with icon and text
 */
export function LastUpdateVersionComponent(props: VersionProps): JSX.Element {
    const theme = useTheme();

    const distanceStyle = {
        margin: 0,
        padding: 0,
    };

    const listTextStyle = {
        margin: 0,
        span: {
            fontSize: "0.75rem",
            fontStyle: "italic",
        },
    };

    const listIconStyle = {
        minWidth: "min-content",
        margin: "0.2em",
        padding: 0,
    };

    const dotIconStyle = {
        fontSize: "0.5rem",
        fill: theme.palette.primary.contrastText,
    };

    return (
        <ListItem sx={distanceStyle}>
            <ListItemIcon sx={listIconStyle}>
                <FiberManualRecordIcon sx={dotIconStyle} />
            </ListItemIcon>
            <ListItemText primary={props.text} sx={listTextStyle} />
        </ListItem>
    );
}
