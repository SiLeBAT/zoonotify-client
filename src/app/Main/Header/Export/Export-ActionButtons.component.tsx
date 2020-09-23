/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import DownloadLink from "react-download-link";
import { Button, DialogActions } from "@material-ui/core";
import { objectToCsv } from "../../../Core/DBEntriesToCSV.service";
import {
    ExportInterface,
    MainFilterLabelInterface,
} from "../../../Shared/Export.model";
import { FilterInterface } from "../../../Shared/Filter.model";
import { errorColor } from "../../../Shared/Style/Style-MainTheme.component";

const ButtonLinkStyle = css`
    all: inherit !important;
`;

const warningStyle = (isSelect: boolean): SerializedStyles => css`
    display: ${isSelect ? "none" : "flex"};
    color: ${errorColor};
    margin-left: 2em;
    font-size: 0.75rem;
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

    let fileIsSelect = true;
    if (!props.setting.raw && !props.setting.stat) {
        fileIsSelect = false;
    }

    return (
        <div>
            <p css={warningStyle(fileIsSelect)}>
                Please select at least one option or cancel the export
            </p>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
                <Button color="primary" disabled={!fileIsSelect}>
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
        </div>
    );
}
