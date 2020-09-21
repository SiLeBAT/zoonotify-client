/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import { useContext, useState } from "react";
import DownloadLink from "react-download-link";
import {
    Button,
    withStyles,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Checkbox,
    FormControlLabel,
} from "@material-ui/core";
import GetAppIcon from "@material-ui/icons/GetApp";
import { useTranslation } from "react-i18next";
import {
    onPrimaryColor,
    primaryColor,
    secondaryColor,
} from "../../Shared/Style/Style-MainTheme.component";
import { DataContext } from "../../Shared/Context/DataContext";
import { FilterContext } from "../../Shared/Context/FilterContext";
import { objectToCsv } from "../../Core/DBEntriesToCSV.service";

const dataStyle = css`
    box-sizing: inherit;
`;
const ButtonStyle = css`
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
const ButtonLinkStyle = css`
    margin: 0px !important;
    font-size: 0.75rem;
    text-decoration: none !important;
    color: ${primaryColor} !important;
`;
const buttonLableStyle = (open: boolean): SerializedStyles => css`
    display: flex;
    align-items: center;
    &:hover {
        color: ${open ? "none" : secondaryColor};
    }
`;

const checkboxStyle = css`
    display: flex;
    flex-direction: column;
    margin-left: 2rem;
`;

const DownloadButton = withStyles({
    root: {
        "&:hover": {
            backgroundColor: "transparent",
        },
    },
})(Button);

function getFormattedTime(): string {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    const d = today.getDate();
    const h = today.getHours();
    const mi = today.getMinutes();
    const s = today.getSeconds();
    return `${y}-${m}-${d}T${h}${mi}${s}`;
}


export function ExportDataComponent(): JSX.Element {
    const [open, setOpen] = useState(false);
    const [setting, setSetting] = useState({
        raw: true,
        sum: true,
    });
    const { data } = useContext(DataContext);
    const { filter } = useContext(FilterContext);
    const { t } = useTranslation(["Header", "QueryPage"]);

    const handleClickOpen = (): void => {
        setOpen(true);
    };

    const handleClose = (): void => {
        setOpen(false);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setSetting({ ...setting, [event.target.name]: event.target.checked });
    };

    const buttonLabel = (
        <div css={buttonLableStyle(open)}>
            <GetAppIcon fontSize="small" />
            {t("Header:Export")}
        </div>
    );
    const ZNFilename = `ZooNotify_${getFormattedTime()}.csv`;

    const mainFilterLabels = {
        Erreger: t("QueryPage:Filters.Erreger"),
        Matrix: t("QueryPage:Filters.Matrix"),
        Projektname: t("QueryPage:Filters.Projektname")
    };
    const allFilterLabel: string = t("QueryPage:Filters.All");

    return (
        <div css={dataStyle}>
            <DownloadButton
                size="small"
                css={ButtonStyle}
                onClick={handleClickOpen}
            >
                {buttonLabel}
            </DownloadButton>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">
                    Export Settings
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You can choose whether to download the complete data set
                        or the displayed statistics or both.
                    </DialogContentText>
                    <div css={checkboxStyle}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={setting.raw}
                                    onChange={handleChange}
                                    name="raw"
                                    color="primary"
                                />
                            }
                            label="Dataset"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={setting.sum}
                                    onChange={handleChange}
                                    name="sum"
                                    color="primary"
                                />
                            }
                            label="Number of Isolates"
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleClose}
                        color="primary"
                        css={ButtonLinkStyle}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleClose} color="primary">
                        <DownloadLink
                            label={buttonLabel}
                            filename={ZNFilename}
                            exportFile={() =>
                                objectToCsv({
                                    data: data.ZNDataFiltered,
                                    keyValues: data.keyValues,
                                    filter,
                                    allFilterLabel,
                                    mainFilterLabels,
                                })
                            }
                            css={ButtonLinkStyle}
                        />
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
