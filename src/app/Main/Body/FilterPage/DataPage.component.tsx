/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { DataPageTableComponent as DataTable } from "./DataPage-Table.component";
import { DBentry, DBtype } from "../../../Shared/Isolat.model";

const dataStyle = css`
    box-sizing: inherit;
`;

interface DataPageProps {
    data: DBentry[];
    keyValues: DBtype[];
}

export function DataPageComponent(props: DataPageProps): JSX.Element {
    return (
        <div css={dataStyle}>
            <DataTable posts={props.data} keyValues={props.keyValues} />
        </div>
    );
}
