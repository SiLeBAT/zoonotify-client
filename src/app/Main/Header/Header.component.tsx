/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExportDataComponent } from "./Export/Header-Export.component";
import { TranslationButtonsComponent as TranslationButtons } from "./TranslationButtons.component";
import {
    primaryColor,
    onPrimaryColor,
    secondaryColor,
    bfrPrimaryPalette,
    surfaceColor,
} from "../../Shared/Style/Style-MainTheme.component";
import { ZNPaths } from "../../Shared/URLs";

const headerStyle = css`
    width: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
`;
const mainHeaderStyle = (open: boolean): SerializedStyles => css`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
    box-sizing: border-box;
    box-shadow: 0 2px 6px 0 grey;
    background-color: ${primaryColor};
    border-bottom: ${open ? `24px solid ${bfrPrimaryPalette[300]}` : "none"};
`;
const appNameStyle = css`
    padding: 0.5em 1em 0.5em 1em;
    font-size: 1.2rem;
    text-decoration: none;
    color: ${onPrimaryColor};
    &:focus {
        outline: none;
    }
`;
const disabledQueryStlye = css`
    margin-right: 8em;
    padding: 0.5em 1em 0.5em 1em;
    font-size: 1rem;
    text-decoration: none;
    cursor: auto;
    color: ${surfaceColor};
`;
const navLinkStyle = (open: boolean): SerializedStyles => css`
    padding: 0.5em 1em 0.5em 1em;
    font-size: 1rem;
    text-decoration: none;
    color: ${onPrimaryColor};
    background-color: ${open ? `${bfrPrimaryPalette[300]}` : "none"};
    &:focus {
        outline: none;
    }
    &:hover {
        color: ${secondaryColor};
    }
`;
const leftHeaderStyle = css`
    display: flex;
    flex-direction: row;
    justify-content: space-around;
`;
const rightHeaderStyle = css`
    margin-right: 8em;
    padding: 0.5em 1em 0.5em 1em;
`;
const subheaderStyle = (open: boolean): SerializedStyles => css`
    width: 100%;
    display: ${open ? "flex" : "none"};
    justify-content: flex-end;
    align-items: center;
    box-sizing: border-box;
    background-color: ${bfrPrimaryPalette[300]};
    box-sizing: border-box;
    box-shadow: 0 2px 6px 0 grey;
`;

export function HeaderLayoutComponent(props: {
    isConnected: boolean;
}): JSX.Element {
    const [queryOpen, setQueryOpen] = useState<boolean>(false);
    const [infoOpen, setInfoOpen] = useState<boolean>(false);
    const { t } = useTranslation(["Header"]);

    const { pathname } = useLocation();
    useEffect(() => {
        if (pathname === ZNPaths.queryPagePath) {
            setQueryOpen(true);
        } else {
            setQueryOpen(false);
        }
        if (pathname === ZNPaths.infoPagePath) {
            setInfoOpen(true);
        } else {
            setInfoOpen(false);
        }
    });

    const handleClick = (e: { preventDefault: () => void }): void => {
        if (!props.isConnected) e.preventDefault();
    };

    return (
        <header css={headerStyle}>
            <div css={mainHeaderStyle(infoOpen)}>
                <div css={leftHeaderStyle}>
                    <NavLink to={ZNPaths.homePagePath} css={appNameStyle}>
                        ZooNotify
                    </NavLink>
                    <TranslationButtons />
                </div>
                <div css={rightHeaderStyle}>
                    <NavLink
                        to={ZNPaths.infoPagePath}
                        css={navLinkStyle(infoOpen)}
                    >
                        {t("Info")}
                    </NavLink>
                    <NavLink
                        onClick={handleClick}
                        to={ZNPaths.queryPagePath}
                        css={
                            props.isConnected
                                ? navLinkStyle(queryOpen)
                                : disabledQueryStlye
                        }
                    >
                        {t("Query")}
                    </NavLink>
                </div>
            </div>

            <div css={subheaderStyle(queryOpen)}>
                <ExportDataComponent />
            </div>
        </header>
    );
}
