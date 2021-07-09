/** @jsx jsx */
import { css } from "@emotion/core";

export const smallSize = 0.75;

export const smallToggleStyle = css`
    margin-right: 0;
    span {
        padding: 0px;
        margin-left: 5px;
        font-size: ${smallSize}rem;
    }
    svg {
        width: ${smallSize}em;
        height: ${smallSize}em;
    }
`;
