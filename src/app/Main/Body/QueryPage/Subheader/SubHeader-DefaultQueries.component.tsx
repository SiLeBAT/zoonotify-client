/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import { Button } from "@mui/material";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import {
    onPrimaryColor,
    secondaryColor,
} from "../../../../Shared/Style/Style-MainTheme";

const buttonLabelStyle = (isOpen: boolean): SerializedStyles => css`
    display: flex;
    align-items: center;
    &:hover {
        color: ${isOpen ? "none" : secondaryColor};
    }
`;

const downloadButtonStyle = css`
    margin-right: 1em;
    padding: 2px 4px;
    line-height: 0px;
    text-transform: none;
    color: ${onPrimaryColor};
    a {
        padding: 0px;
        font-size: 1rem;
        line-height: 1rem;
        font: 400 14px/20px Arial, sans-serif;
    }
`;

/**
 * @desc Returns the export button inside the header.
 * @param props
 * @returns {JSX.Element} - export button component
 */
export function SubHeaderDefaultQueriesButtonComponent(props: {
    onClickOpen: () => void;
    defaultQueriesDialogIsOpen: boolean;
}): JSX.Element {
    const handleClick = (): void => props.onClickOpen();

    const buttonLabel: JSX.Element = (
        <div css={buttonLabelStyle(props.defaultQueriesDialogIsOpen)}>
            <QueryStatsIcon fontSize="small" />
            Beispielabfragen
        </div>
    );

    return (
        <Button
            sx={{
                "&:hover": {
                    backgroundColor: "transparent",
                },
            }}
            size="small"
            css={downloadButtonStyle}
            onClick={handleClick}
        >
            {buttonLabel}
        </Button>
    );
}
