/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import {
    NavLink
  } from "react-router-dom";
import { onPrimaryColor } from '../../Shared/Style/Style-MainTheme.component';


const appNameStyle = css`
    padding: 1rem;
    font-size: 2rem;
    font-weight: bold;
    color: ${onPrimaryColor};
    text-decoration: none;
`


export function HeaderAppNameComponent(): JSX.Element {
    return (
        <NavLink to="/" css={appNameStyle}>
            ZooNotify
        </NavLink>
    );
}

