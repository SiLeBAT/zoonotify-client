/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";

const explanationTextStyle = css`
    font-size: 0.75rem;
`;

export function ExplanationTextComponent(): JSX.Element {
    const { t } = useTranslation("QueryPage");
    return (
        <p css={explanationTextStyle}>
            {t("Explanation")}
        </p>
    );
}
