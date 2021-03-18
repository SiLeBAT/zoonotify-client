/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { ContentResultsContainerComponent } from "./Results/Content-ResultsContainer.component";
import { QueryPageIntroTextComponent } from "./IntroText/QueryPage-IntroText.component";
import { QueryPageParameterContentComponent } from "./Parameter/QueryPage-ParameterContent.component";
import { QueryPageNrOfIsolatesComponent } from "./NumberOfIsolates/QueryPage-NrOfIsolates.component";
import { primaryColor } from "../../../Shared/Style/Style-MainTheme.component";

const contentStyle = css`
    width: 0;
    height: inherit;
    margin-right: 1em;
    margin-left: 1em;
    padding: 2em;
    flex: 1 1 0;
    hyphens: auto;
    box-sizing: border-box;
    overflow: auto;
`;
const contentBoxStyle = css`
    max-width: 60em;
    min-width: 20em;
    margin: auto;
    display: flex;
    flex: 0 1 auto;
    flex-direction: column;
    hyphens: auto;
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
const statusStyle = css`
    text-align: center;
`;
const resultsBoxStyle = css`
    margin-top: 2em;
`;

export function QueryPageContentComponent(props: {
    isCol: boolean;
    isRow: boolean;
    isFilter: boolean;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    return (
        <div css={contentStyle}>
            <h1 css={headingStyle}>{t("Content.Title")}</h1>
            <p css={statusStyle}>{t("Content.DataStatus")}</p>
            <div css={contentBoxStyle}>
                {props.isFilter || props.isCol || props.isRow ? (
                    <QueryPageParameterContentComponent />
                ) : (
                    <QueryPageIntroTextComponent />
                )}
                <QueryPageNrOfIsolatesComponent />
            </div>
            <div css={resultsBoxStyle}>
                <ContentResultsContainerComponent
                    isCol={props.isCol}
                    isRow={props.isRow}
                />
            </div>
        </div>
    );
}
