/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { useTranslation } from 'react-i18next';
import { Button } from '@material-ui/core';
import { handleClick } from './Translate.component';
import { primaryColor, backgroundColor } from '../../Style/Style-MainTheme.component';


const headerStyle = css`
    width: 100%;
    display: flex;
    flex: 0 1 auto;
    justify-content: space-between;
    align-items: center;
    background-color: ${primaryColor};
`

const appNameStyle = css`
    padding: 1rem;
    font-size: 2rem;
    font-weight: bold;
    color: ${backgroundColor};
`
const buttonStyle = css`
    padding: 1rem;
`


export function MainPageHeaderComponent(): JSX.Element {
            const { t } = useTranslation(['MainPage-Header']);
            return (
                <header css={headerStyle}>
                   <span css={appNameStyle}>ZooNotify</span>
                   <div css={buttonStyle}>
                        <Button variant="contained" color="primary" onClick={()=>handleClick('de')} >{t('Button.de', 'Deutsch')}</Button>
                        <Button variant="contained" color="primary" onClick={()=>handleClick('en')}>{t('Button.en', 'Englisch')}</Button>
                    </div>
               </header>
           );
       }

