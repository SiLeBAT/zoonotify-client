/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import {
    surfaceColor,
    shadowPalette,
} from "../../../Shared/Style/Style-MainTheme.component";

const mainTextStyle = css`
    margin: auto;
    padding: 1em;
    line-height: 1.6;
    text-align: justify;
    box-sizing: border-box;
    border: 1px solid ${surfaceColor};
    box-shadow: 0 3px 1px -2px ${shadowPalette.shadow1},
        0 2px 2px 0 ${shadowPalette.shadow2},
        0 1px 5px 0 ${shadowPalette.shadow3};
`;

export function QueryPageTextContentComponent(): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);
    return (
        <div>
            <p css={mainTextStyle}>{t("Content.MainText")}</p>
        </div>
    );
}
