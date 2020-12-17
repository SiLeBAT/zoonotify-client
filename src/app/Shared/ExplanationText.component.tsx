/** @jsx jsx */
import { css, jsx } from "@emotion/core";

const explanationTextStyle = css`
    font-size: 0.75rem;
`;

export function ExplanationTextComponent(): JSX.Element {
    return (
        <p css={explanationTextStyle}>
            - Please select a row/column to display a statistic table -
        </p>
    );
}
