/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { FilterPageContentComponent as Content } from './FilterPage-Content.component'
import { MultipleSelect as YearFilter } from './FilterPage-YearFilter.component';
import { FilterPageButtonsComponent as FilterButtons } from './FilterPage-Buttons';
import { surfaceColor, shadowPalette } from '../../../Shared/Style/Style-MainTheme.component';


const contentStyle = css`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2em;
`
const boxStyle = css`
    padding: 1em;
    border: 1px solid ${surfaceColor};
    width: 50%;
    box-shadow: 0 3px 1px -2px ${shadowPalette.shadow1}, 0 2px 2px 0 ${shadowPalette.shadow2},
    0 1px 5px 0 ${shadowPalette.shadow3};
    display: flex;
    flex: 0 1 auto;
    flex-direction: column;
    justify-content: space-between;
    align-self: flex-start;
    hyphens: auto; 
    text-align: justify
`


export function FilterPageLayoutComponent(): JSX.Element {
    return (
        <main css={contentStyle}>
            <div css={boxStyle}>
                <Content />
                <YearFilter />
                <FilterButtons />
            </div>
        </main>    
    )
}
