/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Button } from "@material-ui/core";
import {
    onPrimaryColor,
    primaryColor,
    secondaryColor,
} from "../../../../../Shared/Style/Style-MainTheme.component";

const buttonStyle = css`
    width: 100%;
    height: 1.5rem;
    margin-top: 0.5em;
    background-color: ${primaryColor};
    color: ${onPrimaryColor};
    &:hover {
        background-color: ${primaryColor};
        color: ${secondaryColor};
    }
`;

export function FilterDialogButtonComponent(props: {
    buttonText: string;
    onOpenFilterDialogClick: () => void;
}): JSX.Element {
    const handleClickOpenFilterSettingDialog = (): void => {
        props.onOpenFilterDialogClick();
    };

    return (
        <Button
            css={buttonStyle}
            onClick={handleClickOpenFilterSettingDialog}
            color="primary"
        >
            {props.buttonText}
        </Button>
    );
}
