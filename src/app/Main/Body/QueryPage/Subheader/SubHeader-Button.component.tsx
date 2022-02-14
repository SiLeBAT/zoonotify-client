import React from "react";
import { Button } from "@mui/material";
import {
    onPrimaryColor,
    secondaryColor,
} from "../../../../Shared/Style/Style-MainTheme";

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
            sx={{
                padding: "2px 4px",
                lineHeight: "0px",
                textTransform: "none",
                color: `${onPrimaryColor}`,
                span: {
                    marginRight: "2px",
                },
                "&:hover": {
                    color: `${secondaryColor}`,
                },
            }}
            size="small"
            onClick={handleClick}
            startIcon={props.buttonIcon}
        >
            {props.buttonText}
        </Button>
    );
}
