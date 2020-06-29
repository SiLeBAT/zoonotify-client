/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { onTertiaryColor, tertiaryColor } from '../../Style/Style-MainTheme.component';
import { environment } from '../../../environment';


const footerDateStyle = css`
    font-size: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${onTertiaryColor};
    background-color: ${tertiaryColor};
`

export function LastUpdate(): JSX.Element  {
    const {lastChange} = environment; 
    const { t } = useTranslation(['MainPage-Footer']);
    const dateLayout = t('Date.Layout', 'de');
    return (
        <div css={footerDateStyle}>
            <p>{t('Date.Text', 'Letzte Änderung: ')} {moment(lastChange, "YYYY-MM-DD HH:mm:ss Z", dateLayout, true).format("L")}</p>
        </div>
    )
}
