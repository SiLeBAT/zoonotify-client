/** @jsx jsx */
import { css, jsx } from "@emotion/core";

const dataTableStyle = css`
    overflow: auto;
`;
const tableDivStyle = css`
    display: flex;
    flex-direction: row;
`;

/**
 * @desc Decides if row/colum is selected and return result table or explanation text
 * @param columnAttributes - column attributes for the table header
 * @returns {JSX.Element} - result table
 */
export function TableLayout(props: {
    // eslint-disable-next-line react/require-default-props
    columnMainHeader?: JSX.Element;
    // eslint-disable-next-line react/require-default-props
    rowMainHeader?: JSX.Element;
    table: JSX.Element;
}): JSX.Element {
    return (
        <div>
            {props.columnMainHeader}
            <div css={tableDivStyle}>
                {props.rowMainHeader}
                <div css={dataTableStyle}>{props.table}</div>
            </div>
        </div>
    );
}
