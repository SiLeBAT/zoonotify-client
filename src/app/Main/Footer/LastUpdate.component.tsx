/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { onBackgroundColor } from '../../Shared/Style/Style-MainTheme.component';
import { environment } from '../../../environment';


const footerDateStyle = css`
    font-size: 0.75rem;
    display: flex;
    justify-content: center;
    align-items: center; 
    color: ${onBackgroundColor};
`
const dateStyle = css`
    margin: 0;
    padding: 1em; 
`

export function LastUpdate(): JSX.Element  {
    const {lastChange} = environment; 
    const { t } = useTranslation(['Footer']);
    const dateLayout = t('Date.Layout');
    return (
        <div css={footerDateStyle}>
            <p css={dateStyle}>{t('Date.Text')} {moment(lastChange, "YYYY-MM-DD HH:mm:ss Z", dateLayout, true).format("L")}</p>
        </div>
    )
}
