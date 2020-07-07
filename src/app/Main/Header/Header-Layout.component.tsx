/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { HeaderAppNameComponent as AppName } from './Header-AppName.component';
import { TranslationButtonsComponent as TranslationButtons } from './TranslationButtons.component';
import { primaryColor } from '../../Shared/Style/Style-MainTheme.component';


const headerStyle = css`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: ${primaryColor};
`


export function HeaderLayoutComponent(): JSX.Element {
    return (
        <header css={headerStyle}>
            <AppName />
            <TranslationButtons />
        </header>
    );
}

