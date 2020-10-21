/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import { CSVLink } from "react-csv";
import { useTranslation } from "react-i18next";
import { Button, DialogActions } from "@material-ui/core";
import { objectToCsv } from "../../../Core/ExportServices/objectToCSV.service";
import { objectToZIP } from "../../../Core/ExportServices/objectsToZIP.service";
import {
    ExportInterface,
    MainFilterLabelInterface,
} from "../../../Shared/Export.model";
import { FilterInterface } from "../../../Shared/Filter.model";
import { errorColor } from "../../../Shared/Style/Style-MainTheme.component";

const buttonLinkStyle = css`
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
    mainFilterAttributes: string[];
}

export function ExportActionButtonComponent(
    props: ExportActionButtonProps
): JSX.Element {
    const { t } = useTranslation(["Export"]);

    const handleClose = (event: unknown): void => {
        props.onClick(event);
    };

    let fileIsSelect = true;
    if (!props.setting.raw && !props.setting.stat) {
        fileIsSelect = false;
    }

    let subFileName = "";
    if (props.setting.raw && !props.setting.stat) {
        subFileName = "RAW-Data";
    }
    if (!props.setting.raw && props.setting.stat) {
        subFileName = "Statistic-Data";
    }

    return (
        <div>
            <p css={warningStyle(fileIsSelect)}>{t("Warning")}</p>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    {t("Button.Cancel")}
                </Button>
                <Button color="primary" disabled={!fileIsSelect}>
                    <CSVLink
                        data={objectToCsv({
                            setting: props.setting,
                            filter: props.filter,
                            allFilterLabel: props.allFilterLabel,
                            mainFilterLabels: props.mainFilterLabels,
                            mainFilterAttributes: props.mainFilterAttributes
                        })}
                        filename={`${subFileName}_${props.ZNFilename}`}
                        target="_blank"
                        onClick={() => {
                            if (props.setting.raw && props.setting.stat) {
                                objectToZIP({
                                    setting: props.setting,
                                    ZNFilename: props.ZNFilename,
                                    filter: props.filter,
                                    allFilterLabel: props.allFilterLabel,
                                    mainFilterLabels: props.mainFilterLabels,
                                    mainFilterAttributes: props.mainFilterAttributes
                                });
                                return false;
                            }
                            return true;
                        }}
                        css={buttonLinkStyle}
                    >
                        {props.buttonLabel}
                    </CSVLink>
                </Button>
            </DialogActions>
        </div>
    );
}
