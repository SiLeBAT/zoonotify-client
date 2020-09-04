/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useContext } from "react";
import DownloadLink from "react-download-link";
import { Button, withStyles } from "@material-ui/core";
import GetAppIcon from "@material-ui/icons/GetApp";
import { useTranslation } from "react-i18next";
import {
    onPrimaryColor,
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
    color: ${onPrimaryColor} !important;
`;
const ButtonLableStyle = css`
    display: flex;
    align-items: center;
    &:hover {
        color: ${secondaryColor};
    }
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
    const { data } = useContext(DataContext);
    const { filter } = useContext(FilterContext);
    const { t } = useTranslation(["Header", "QueryPage"]);

    const buttonLabel = (
        <div css={ButtonLableStyle}>
            <GetAppIcon fontSize="small" />
            {t("Header:Export")}
        </div>
    );
    const ZNFilename = `ZooNotify_${getFormattedTime()}.csv`;

    const mainFilterLabels = {
        Erreger: t("QueryPage:Drawer.Filters.Erreger"),
        Matrix: t("QueryPage:Drawer.Filters.Matrix"),
        Projektname: t("QueryPage:Drawer.Filters.Projektname")
    };
    const allFilterLabel: string = t("QueryPage:Drawer.Filters.All");

    return (
        <div css={dataStyle}>
            <DownloadButton size="small" css={ButtonStyle}>
                <DownloadLink
                    label={buttonLabel}
                    filename={ZNFilename}
                    exportFile={() =>
                        objectToCsv({
                            data: data.ZNData,
                            keyValues: data.keyValues,
                            filter,
                            allFilterLabel,
                            mainFilterLabels
                        })
                    }
                    css={ButtonLinkStyle}
                />
            </DownloadButton>
        </div>
    );
}
