/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { useState } from 'react';
import { changeAppLanguage } from '../../Core/localization.service';

const buttonAreaStyle = css`
    padding: 0.5em; 
`

type StyledComponentProps = {
    bgImage: string
}

const Button = styled('button')`
    margin: 0.2em;
    padding: 0;
    width: 16px;
    height: 10.5px;
    cursor: pointer;
    border: none;
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
`
const selectedFlagStyle = css`
    width: 20px;
    height: 13.1px;
    &:hover {
        transform: none;
    }
`

export function TranslationButtonsComponent(): JSX.Element {
    const [selectedFlag, setSelectedFlag] = useState(true);

    return (
        <div css={buttonAreaStyle}>
            <Button type='button' css={selectedFlag ? selectedFlagStyle : 'none'} bgImage="url('/assets/germany_flag_icon.png')"
                onClick={() => {
                    changeAppLanguage('de'); 
                    setSelectedFlag(true)
                }} 
            >
                &nbsp;
            </Button>
            <Button type='button' css={selectedFlag ? 'none' : selectedFlagStyle} bgImage="url('/assets/united_kingdom_flag_icon.png')"
                onClick={() => {
                    changeAppLanguage('en'); 
                    setSelectedFlag(false)
                }} 
            >
                &nbsp;
            </Button>
        </div>
    );
}
