/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import moment from 'moment';
import {bfrBlueGrey, bfrDarkBlueGrey } from '../../Style/Style-MainTheme.component';
import {environment} from '../../../../environment';


const footerDateStyle = css`
    font-size: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${bfrBlueGrey};
    background-color: ${bfrDarkBlueGrey};
`

export function LastUpdate(): JSX.Element  {
    const {lastChange} = environment; 
    return (
        <div css={footerDateStyle}>
            <p>Letzte Änderung: {moment(lastChange, "YYYY-MM-DD HH:mm:ss Z", "de").format("L")}</p>
        </div>
    )
}
