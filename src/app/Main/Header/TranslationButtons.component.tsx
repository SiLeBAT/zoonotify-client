/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import styled from "@emotion/styled";
import { useState, useEffect } from "react";
import i18next from "i18next";
import { changeAppLanguage } from "../../Core/localization.service";
import { primaryColor } from "../../Shared/Style/Style-MainTheme.component";

const buttonAreaStyle = css`
    margin-left: 2em;
    display: flex;
    align-items: center;
    box-sizing: inherit;
`;

type StyledComponentProps = {
    bgImage: string;
};

const Button = styled("button")`
    margin: 0.2em;
    padding: 0;
    width: 14px;
    height: 9.19px;
    cursor: pointer;
    border: none;
    background-color: ${primaryColor};
    background-image: ${(props: StyledComponentProps) => props.bgImage};
    background-repeat: no-repeat;
    background-size: contain;
    &::-moz-focus-inner {
        border: none;
    }
    &:focus {
        outline: none;
    }
    &:hover {
        transform: scale(1.2, 1.2);
    }
`;
const selectedFlagStyle = css`
    width: 18px;
    height: 11.79px;
    &:hover {
        transform: none;
    }
`;

export function TranslationButtonsComponent(): JSX.Element {
    const [selectedFlag, setSelectedFlag] = useState(true);

    useEffect((): void => {
        switch (i18next.language) {
            case "de":
                setSelectedFlag(true);
                break;
            case "en":
                setSelectedFlag(false);
                break;
            default:
                setSelectedFlag(true);
                break;
        }
    });

    return (
        <div css={buttonAreaStyle}>
            <Button
                type="button"
                css={selectedFlag ? selectedFlagStyle : "none"}
                bgImage="url('/assets/germany_flag_icon.png')"
                onClick={() => {
                    localStorage.setItem("i18nextLng", "de");
                    changeAppLanguage("de");
                }}
            >
                &nbsp;
            </Button>
            <Button
                type="button"
                css={selectedFlag ? "none" : selectedFlagStyle}
                bgImage="url('/assets/united_kingdom_flag_icon.png')"
                onClick={() => {
                    localStorage.setItem("i18nextLng", "en");
                    changeAppLanguage("en");
                }}
            >
                &nbsp;
            </Button>
        </div>
    );
}
