/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { useTranslation } from 'react-i18next';
import { Button } from '@material-ui/core';
import { changeAppLanguage } from '../../Core/localization.service';


const buttonStyle = css`
    padding: 1rem;
`


export function TranslationButtonsComponent(): JSX.Element {
    const { t } = useTranslation(['Header']);
    return (
        <div css={buttonStyle}>
            <Button variant="contained" color="primary" onClick={()=>changeAppLanguage('de')} >{t('Button.de')}</Button>
            <Button variant="contained" color="primary" onClick={()=>changeAppLanguage('en')}>{t('Button.en')}</Button>
        </div>
    );
}

