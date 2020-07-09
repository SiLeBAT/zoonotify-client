/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { changeAppLanguage } from '../../Core/localization.service';
import { backgroundColor } from '../../Shared/Style/Style-MainTheme.component';


const buttonStyle = css`
    padding: 0.5em;  
`
const flagStyle = css`
    margin: 0.5em;
    padding: 0;
    cursor: pointer;
    background-color: ${backgroundColor};
    border: none;
`

function countryToFlag(isoCode: string): string {
    return typeof String.fromCodePoint !== 'undefined'
      ? isoCode
          .toUpperCase()
          .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
      : isoCode;
}

export function TranslationButtonsComponent(): JSX.Element {
    return (
        <div css={buttonStyle}>
            <button type='button' onClick={()=>changeAppLanguage('de')} css={flagStyle}>{countryToFlag('DE')}</button>
            <button type='button' onClick={()=>changeAppLanguage('en')} css={flagStyle}>{countryToFlag('GB')}</button>
        </div>
    );
}
