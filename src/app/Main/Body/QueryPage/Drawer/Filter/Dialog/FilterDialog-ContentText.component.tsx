/** @jsx jsx */
import { css, jsx } from "@emotion/core";

import { DialogContentText } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
    primaryColor,
    secondaryColor,
} from "../../../../../../Shared/Style/Style-MainTheme.component";

const linkStyle = css`
    color: ${primaryColor};
    &:hover {
        color: ${secondaryColor};
    }
`;

export function FilterDialogContentTextComponent(): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    return (
        <DialogContentText>
            {t("FilterDialog.TextContentBeforeLink")}
            <Link css={linkStyle} to="/explanations">
                {t("FilterDialog.LinkText")}
            </Link>
            {t("FilterDialog.TextContentAfterLink")}
        </DialogContentText>
    );
}
