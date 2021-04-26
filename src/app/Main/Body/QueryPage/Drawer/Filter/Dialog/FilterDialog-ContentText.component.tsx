/** @jsx jsx */
import { css, jsx } from "@emotion/core";

import { DialogContentText } from "@material-ui/core";
import { Link } from "react-router-dom";
import { primaryColor, secondaryColor } from "../../../../../../Shared/Style/Style-MainTheme.component";

const linkStyle = css`
    color: ${primaryColor};
    &:hover {
        color: ${secondaryColor};
    }
`;

export function FilterDialogContentTextComponent(): JSX.Element {
    return (
        <DialogContentText>
            Please select your desired filters. The selected filters will be
            displayed after clicking the submit button. More information about
            the filters can be found on the{" "}
            <Link css={linkStyle} to="/explanations">
                Explanations
            </Link>{" "}
            page.
        </DialogContentText>
    );
}
