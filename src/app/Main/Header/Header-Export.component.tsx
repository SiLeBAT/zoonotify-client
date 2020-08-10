/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import DownloadLink from "react-download-link";
import { Button, withStyles } from "@material-ui/core";
import GetAppIcon from "@material-ui/icons/GetApp";
import { useTranslation } from "react-i18next";
import {
    onPrimaryColor,
    secondaryColor,
} from "../../Shared/Style/Style-MainTheme.component";
import { DBentry, DBtype } from "../../Shared/Isolat.model";

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

interface ObjectToCsvProps {
    data: DBentry[];
    keyValues: DBtype[];
}

function objectToCsv(props: ObjectToCsvProps): string {
    const csvRows: string[] = [];
    const headers: DBtype[] = props.keyValues;
    csvRows.push(headers.join(","));

    props.data.forEach((row: DBentry) => {
        const values: string[] = headers.map((header: DBtype) => {
            const escaped: string = `${row[header]}`
                .replace(/"/g, '\\"')
                .replace("undefined", "");
            return `"${escaped}"`;
        });
        csvRows.push(values.join(","));
    });
    const csvData: string = csvRows.join("\n");

    return csvData;
}

interface ExportProps {
    data: DBentry[];
    keyValues: DBtype[];
}

export function ExportDataComponent(props: ExportProps): JSX.Element {
    const { t } = useTranslation(["Header"]);
    const { data } = props;
    const { keyValues } = props;

    const buttonLabel = (
        <div css={ButtonLableStyle}>
            <GetAppIcon fontSize="small" />
            {t("Export")}
        </div>
    );
    const znFilename = `ZooNotify_${getFormattedTime()}.csv`;
    return (
        <div css={dataStyle}>
            <DownloadButton size="small" css={ButtonStyle}>
                <DownloadLink
                    label={buttonLabel}
                    filename={znFilename}
                    exportFile={() => objectToCsv({ data, keyValues })}
                    css={ButtonLinkStyle}
                />
            </DownloadButton>
        </div>
    );
}
