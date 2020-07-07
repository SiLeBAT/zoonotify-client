/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { NavLink } from "react-router-dom";
import { Button } from '@material-ui/core';
import { onPrimaryColor } from '../../../Shared/Style/Style-MainTheme.component';


const buttonStyle = css`
    padding: 3rem;
    font-weight: bold;
    color: ${onPrimaryColor};
    text-decoration: none;
`


export function HomeButtonComponent(): JSX.Element {
    return (
        <div css={buttonStyle}>
            <NavLink to="/filter">
                <Button variant="contained" color="primary">Start</Button>
            </NavLink>
        </div>
    )
}