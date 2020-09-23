/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import DownloadLink from "react-download-link";
import { Button, DialogActions } from "@material-ui/core";
import { primaryColor } from "../../../Shared/Style/Style-MainTheme.component";
import { objectToCsv } from "../../../Core/DBEntriesToCSV.service";
import {
    ExportInterface,
    MainFilterLabelInterface,
} from "../../../Shared/Export.model";
import { FilterInterface } from "../../../Shared/Filter.model";

const ButtonLinkStyle = css`
    margin: 0px !important;
    font-size: 0.75rem;
    text-decoration: none !important;
    color: ${primaryColor} !important;
`;

interface ExportActionButtonProps {
    onClick: (event: unknown) => void;
    open: boolean;
    setting: ExportInterface;
    filter: FilterInterface;
    buttonLabel: JSX.Element;
    ZNFilename: string;
    mainFilterLabels: MainFilterLabelInterface;
    allFilterLabel: string;
}

export function ExportActionButtonComponent(
    props: ExportActionButtonProps
): JSX.Element {
    const handleClose = (event: unknown): void => {
        props.onClick(event);
    };

    return (
        <DialogActions>
            <Button onClick={handleClose} color="primary" css={ButtonLinkStyle}>
                Cancel
            </Button>
            <Button onClick={handleClose} color="primary">
                <DownloadLink
                    label={props.buttonLabel}
                    filename={props.ZNFilename}
                    exportFile={() =>
                        objectToCsv({
                            setting: props.setting,
                            filter: props.filter,
                            allFilterLabel: props.allFilterLabel,
                            mainFilterLabels: props.mainFilterLabels,
                        })
                    }
                    css={ButtonLinkStyle}
                />
            </Button>
        </DialogActions>
    );
}
