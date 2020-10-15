/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { environment } from "../../../environment";
import { onBackgroundColor } from "../../Shared/Style/Style-MainTheme.component";

const dateStyle = css`
    margin: 1em;
    margin-left: 15px;
    padding: 0;
    line-height: 1.05;
    font-size: 0.75rem;
    color: ${onBackgroundColor};
`;

export function LastUpdateComponent(): JSX.Element {
    const { lastChange } = environment;
    const { t } = useTranslation(["Footer"]);
    const dateLayout = t("Date.Layout");

    return (
        <p css={dateStyle}>
            {t("Date.Text")}{" "}
            {moment(
                lastChange,
                "YYYY-MM-DD HH:mm:ss ZZ",
                dateLayout,
                true
            ).format("DD.MM.YYYY")}
        </p>
    );
}
