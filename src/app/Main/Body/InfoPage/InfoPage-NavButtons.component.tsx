/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Button } from "@material-ui/core";
import {
    onPrimaryColor,
    primaryColor,
    secondaryColor,
} from "../../../Shared/Style/Style-MainTheme.component";

const navButtonDivStyle = css`
    width: fit-content;
    margin: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;
const navButtonStyle = css`
    margin: 0.25em;
    background-color: ${primaryColor};
    color: ${onPrimaryColor};
    &:hover {
        background-color: ${primaryColor};
        color: ${secondaryColor};
    }
`;

export function InfoPageNavButtonsComponent(props: {
    backgroundButtonLabel: string;
    filtersButtonLabel: string;
    methodsButtonLabel: string;
}): JSX.Element {

    return (
        <div css={navButtonDivStyle}>
            <Button css={navButtonStyle} href="#background">
                {props.backgroundButtonLabel}
            </Button>
            <Button css={navButtonStyle} href="#filter">
                {props.filtersButtonLabel}
            </Button>
            <Button css={navButtonStyle} href="#methods">
                {props.methodsButtonLabel}
            </Button>
        </div>
    );
}
