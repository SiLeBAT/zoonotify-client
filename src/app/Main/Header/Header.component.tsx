/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TranslationButtonsComponent } from "./TranslationButtons.component";
import {
    primaryColor,
    onPrimaryColor,
    secondaryColor,
    bfrPrimaryPalette,
    surfaceColor,
} from "../../Shared/Style/Style-MainTheme.component";
import { ZNPaths } from "../../Shared/URLs";
import { HeaderExportContainerComponent } from "./Export/Header-ExportContainer.component";

const headerStyle = css`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
`;
const mainHeaderStyle = (open: boolean): SerializedStyles => css`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    box-sizing: border-box;
    box-shadow: 0 8px 6px -6px grey;
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
const disabledQueryStyle = css`
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
`;
const rightHeaderStyle = css`
    height: 100%;
    margin-right: 8em;
    display: flex;
    align-items: flex-end;
`;
const subheaderStyle = (open: boolean): SerializedStyles => css`
    width: 100%;
    display: ${open ? "flex" : "none"};
    justify-content: flex-end;
    align-items: center;
    background-color: ${bfrPrimaryPalette[300]};
    box-sizing: border-box;
    box-shadow: 0 8px 6px -6px grey;
`;

/**
 * @desc Header of the page with navigation
 * @param isConnected - true if client is connected to the server
 * @returns {JSX.Element} - header component
 */
export function HeaderComponent(props: { isConnected: boolean }): JSX.Element {
    const [linkOpen, setLinkOpen] = useState<boolean>(false);
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
        if (pathname === ZNPaths.linkPagePath) {
            setLinkOpen(true);
        } else {
            setLinkOpen(false);
        }
    });

    const handleClick = (e: { preventDefault: () => void }): void => {
        if (!props.isConnected) e.preventDefault();
    };

    return (
        <header css={headerStyle}>
            <div css={mainHeaderStyle(infoOpen || linkOpen)}>
                <div css={leftHeaderStyle}>
                    <NavLink to={ZNPaths.homePagePath} css={appNameStyle}>
                        ZooNotify
                    </NavLink>
                    <TranslationButtonsComponent />
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
                                : disabledQueryStyle
                        }
                    >
                        {t("Query")}
                    </NavLink>
                    <NavLink
                        to={ZNPaths.linkPagePath}
                        css={navLinkStyle(linkOpen)}
                    >
                        {t("Links")}
                    </NavLink>
                </div>
            </div>

            <div css={subheaderStyle(queryOpen)}>
                <HeaderExportContainerComponent />
            </div>
        </header>
    );
}
