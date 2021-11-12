/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { primaryColor } from "../../../../Shared/Style/Style-MainTheme.component";

const contentStyle = css`
    width: 0;
    padding: 2em;
    flex: 1 1 0;
    hyphens: auto;
    box-sizing: border-box;
    overflow: auto;
`;
const contentBoxStyle = css`
    max-width: 45em;
    margin: auto;
    box-sizing: border-box;
`;
const headingStyle = css`
    margin: 0;
    min-width: 7em;
    font-size: 3rem;
    text-align: center;
    font-weight: normal;
    color: ${primaryColor};
`;

const resultsBoxStyle = css`
    margin-top: 2em;
`;

export function QueryPageContentLayoutComponent(props: {
    status: JSX.Element;
    queryPageInfo: JSX.Element;
    nrOfIsolates: JSX.Element;
    tableResults: JSX.Element;
    chartResults: JSX.Element;
    isFilter: boolean;
    title: string;
}): JSX.Element {
    return (
        <div css={contentStyle}>
            <p css={headingStyle}>{props.title}</p>
            {props.status}
            <div css={contentBoxStyle}>
                {props.queryPageInfo}
                {props.nrOfIsolates}
            </div>
            <div css={resultsBoxStyle}>
                {props.tableResults}
                {props.chartResults}
            </div>
        </div>
    );
}
