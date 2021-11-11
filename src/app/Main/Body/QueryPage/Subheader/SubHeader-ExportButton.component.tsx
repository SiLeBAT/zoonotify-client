/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Button, withStyles } from "@material-ui/core";
import { ExportButtonLabelComponent } from "../../../../Shared/Export-ButtonLabel.component";
import { onPrimaryColor } from "../../../../Shared/Style/Style-MainTheme.component";

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

/**
 * @desc Returns the export button inside the header.
 * @param props
 * @returns {JSX.Element} - export button component
 */
export function SubHeaderExportButtonComponent(props: {
    onClickOpen: () => void;
    exportDialogIsOpen: boolean;
}): JSX.Element {
    const handleClick = (): void => props.onClickOpen();

    const buttonLabel: JSX.Element = ExportButtonLabelComponent(
        props.exportDialogIsOpen
    );

    return (
        <DownloadButton
            size="small"
            css={downloadButtonStyle}
            onClick={handleClick}
        >
            {buttonLabel}
        </DownloadButton>
    );
}
