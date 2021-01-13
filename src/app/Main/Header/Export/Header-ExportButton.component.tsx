/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Button, withStyles } from "@material-ui/core";
import { onPrimaryColor } from "../../../Shared/Style/Style-MainTheme.component";

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

const DownloadButton = withStyles({
    root: {
        "&:hover": {
            backgroundColor: "transparent",
        },
    },
})(Button);

interface ExportButtonProps {
    onClick: (event: unknown) => void;
    buttonLabel: JSX.Element;
}

/**
 * @desc Returns the export button inside the header.
 * @param {(event: unknown) => void} onClick - function to handle the open/close of the export dialog
 * @param {JSX.Element} buttonLabel - component for the button label
 * @returns {JSX.Element} - export button component
 */
export function HeaderExportButtonComponent(props: ExportButtonProps): JSX.Element {
    const handleClickOpen = (event: unknown): void => {
        props.onClick(event);
    };

    return (
        <DownloadButton
            size="small"
            css={downloadButtonStyle}
            onClick={handleClickOpen}
        >
            {props.buttonLabel}
        </DownloadButton>
    );
}
