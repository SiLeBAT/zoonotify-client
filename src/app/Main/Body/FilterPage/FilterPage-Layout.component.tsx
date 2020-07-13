/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { FilterPageContentComponent as TextContent } from './FilterPage-Content.component';
import { DataPageDataContentComponent as DataContent } from './DataPage-DataContent.component';
import { surfaceColor, shadowPalette } from '../../../Shared/Style/Style-MainTheme.component';


const contentStyle = css`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2em;

`
const boxStyle = css`
 display: flex;
    flex: 0 1 auto;
    flex-direction: column;
    align-self: center;
    hyphens: auto; 
    text-align: justify;
    padding: 1em;
    border: 1px solid ${surfaceColor};
    width: 100%;
    height: 75vh;
    box-shadow: 0 3px 1px -2px ${shadowPalette.shadow1}, 0 2px 2px 0 ${shadowPalette.shadow2},
    0 1px 5px 0 ${shadowPalette.shadow3};
`


export function FilterPageLayoutComponent(): JSX.Element {
    return (
        <main css={contentStyle}>
            <div css={boxStyle}>
                <div>
                    <TextContent />
                </div>
                <DataContent />              
            </div>
        </main>    
    )
}
