/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useState, useEffect } from "react";
import DownloadLink from "react-download-link";
import { Button } from "@material-ui/core";
import {
    primaryColor,
    onPrimaryColor,
    bfrPrimaryPalette,
} from "../../../Shared/Style/Style-MainTheme.component";
import { DataPageTableComponent as DataTable } from "./DataPage-Table.component";
import { DBentry, DBtype } from "./Isolat.model";

const dataStyle = css`
    box-sizing: inherit;
`;

const ButtonStyle = css`
    margin: 10px;
    padding: 0px;
    background-color: ${primaryColor};
    color: ${onPrimaryColor};
    &:hover {
        background-color: ${bfrPrimaryPalette[600]};
    }
`;
const ButtonLinkStyle = css`
    margin: 0px !important;
    padding: 10px;
    font-size: 0.75rem;
    text-decoration: none !important;
    color: ${onPrimaryColor} !important;
`;

const BASE_URL = "/v1/mockdata";

interface ObjectToCsvProps {
    posts: DBentry[];
    keyValues: DBtype[];
}

function objectToCsv(props: ObjectToCsvProps): string {
    const csvRows: string[] = [];

    const headers: DBtype[] = props.keyValues;
    csvRows.push(headers.join(","));

    props.posts.forEach((row: DBentry) => {
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

export function DataPageDataContentComponent(): JSX.Element {
    const [posts, setPosts] = useState<DBentry[]>([]);

    const keyValues: DBtype[] = [
        "Erreger",
        "BfR_Isolat_Nr",
        "Projektname",
        "ESBL_AmpC_Carb",
        "Spa_Typ",
        "Entero_Spez",
        "Campy_Spez",
        "Serovar",
        "Serotyp",
        "O_Gruppe",
        "H_Gruppe",
        "stx1",
        "stx2",
        "Shigatoxin",
        "eae",
        "e_hly_gen",
        "AMP_Res",
        "ZI_Res",
        "HL_Res",
        "IP_Res",
        "LI_Res",
        "COL_Res",
        "RY_Res",
        "FOT_Res",
        "OX_Res",
        "FUS_Res",
        "GEN_Res",
        "AN_Res",
        "LZD_Res",
        "MERO_Res",
        "UP_Res",
        "NAL_Res",
        "EN_Res",
        "RIF_Res",
        "SMX_Res",
        "TR_Res",
        "SYN_Res",
        "TAZ_Res",
        "ET_Res",
        "GC_Res",
        "IA_Res",
        "TMP_Res",
        "AN_Res",
        "Programm",
        "OriginalnrDesEinsenders",
        "Matrix",
        "Land",
    ];

    const getData = async (): Promise<void> => {
        const r: Response = await fetch(BASE_URL);
        const data: DBentry[] = await r.json();
        let i = 0;
        for (i; i < data.length; i += 1) {
            data[i].uniqueId = i + 1;
        }
        setPosts(data);
    };

    useEffect((): void => {
        getData();
    }, []);

    const znFilename = `zoonoitify_${getFormattedTime()}.csv`;

    return (
        <div css={dataStyle}>
            <Button css={ButtonStyle} variant="contained" color="primary">
                <DownloadLink
                    label="Download CSV"
                    filename={znFilename}
                    exportFile={() => objectToCsv({ posts, keyValues })}
                    css={ButtonLinkStyle}
                />
            </Button>
            <DataTable posts={posts} keyValues={keyValues} />
        </div>
    );
}
