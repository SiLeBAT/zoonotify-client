/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { NavLink } from "react-router-dom";
import { Button } from '@material-ui/core';
import { HomePageContentComponent as Content } from './HomePage-Content.component';
import { surfaceColor, shadowPalette } from '../../../Shared/Style/Style-MainTheme.component';

const contentStyle = css`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
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
const boxFooterStyle = css`
    display: flex;
    justify-content: space-between;
    align-items: center;
`
const logoStyle = css`
    margin-top: 2rem;
    max-width: 100%;
    height: auto;
    margin-bottom: 2rem;
`
const buttonStyle = css`
    padding: 3rem;
`



export function HomePageLayoutComponent(): JSX.Element {
    return (
        <main css={contentStyle}>
            <div css={boxStyle}>
                <Content />
                <div css={boxFooterStyle}>
                    <img src="/assets/bfr_logo.gif" alt="BfR Logo" css={logoStyle}/> 
                    <NavLink to="/filter" css={buttonStyle}>
                        <Button variant="contained" color="primary">Start</Button>
                    </NavLink>
                </div>
            </div>
        </main>    
    )
}