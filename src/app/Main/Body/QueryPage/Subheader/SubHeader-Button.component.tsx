import React from "react";
import { Button } from "@mui/material";
import {
    onPrimaryColor,
    secondaryColor,
} from "../../../../Shared/Style/Style-MainTheme";

const subHeaderButtonStyle = {
    padding: "2px 4px",
    "line-height": "0px",
    "text-transform": "none",
    color: `${onPrimaryColor}`,
    span: {
        "margin-right": "2px",
    },
    "&:hover": {
        color: `${secondaryColor}`,
    },
};

/**
 * @desc Returns the export button inside the header.
 * @param props
 * @returns {JSX.Element} - export button component
 */
export function SubHeaderButtonComponent(props: {
    onClickOpen: () => void;
    buttonIcon: JSX.Element;
    buttonText: string;
}): JSX.Element {
    const handleClick = (): void => props.onClickOpen();

    return (
        <Button
            sx={subHeaderButtonStyle}
            size="small"
            onClick={handleClick}
            startIcon={props.buttonIcon}
        >
            {props.buttonText}
        </Button>
    );
}
