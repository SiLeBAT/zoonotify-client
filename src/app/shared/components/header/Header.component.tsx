/** @jsxImportSource @emotion/react */
import { useEffect, useState } from "react";
// eslint-disable-next-line import/named
import { SerializedStyles } from "@emotion/core";
import { css } from "@emotion/react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import { pageRoute } from "../../infrastructure/router/routes";
import {
    headerHeight,
    onPrimaryColor,
    onSecondaryColor,
    primaryColor,
    secondaryColor,
} from "../../style/Style-MainTheme";
import { TranslationButtonsComponent } from "./TranslationButtons.component";

const headerStyle = css`
    width: 100%;
    height: ${headerHeight}px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
`;

const mainHeaderStyle = (): SerializedStyles => css`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    box-sizing: border-box;
    box-shadow: "0 8px 6px -6px grey";
    background-color: ${primaryColor};
    color: ${onSecondaryColor};
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
const navLinkStyle = (open: boolean): SerializedStyles => css`
    padding: 0.5em 1em 0.5em 1em;
    font-size: 1rem;
    text-decoration: none;
    background-color: ${open ? `${secondaryColor}` : "none"};
    color: ${open ? `${onSecondaryColor}` : `${onPrimaryColor}`};
    &:focus {
        outline: none;
    }
    &:hover {
        color: ${open ? `${onSecondaryColor}` : `${secondaryColor}`};
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

/**
 * @desc Header of the page with navigation
 * @param isConnected - true if client is connected to the server
 * @returns {JSX.Element} - header component
 */
export function HeaderComponent(): JSX.Element {
    const [linkOpen, setLinkOpen] = useState<boolean>(false);
    const [linkedDataOpen, setLinkedDataOpen] = useState<boolean>(false);
    const [infoOpen, setInfoOpen] = useState<boolean>(false);
    const [evaluationsOpen, setEvaluationsOpen] = useState<boolean>(false);
    const [prevalenceOpen, setPrevalenceOpen] = useState<boolean>(false);

    const { t } = useTranslation(["Header"]);
    const showLD = Boolean(process.env.REACT_APP_SHOW_LD);
    const { pathname } = useLocation();

    useEffect(() => {
        if (pathname === pageRoute.infoPagePath) {
            setInfoOpen(true);
        } else {
            setInfoOpen(false);
        }
        if (pathname === pageRoute.linkPagePath) {
            setLinkOpen(true);
        } else {
            setLinkOpen(false);
        }
        if (pathname === pageRoute.evaluationsPagePath) {
            setEvaluationsOpen(true);
        } else {
            setEvaluationsOpen(false);
        }

        if (pathname === pageRoute.prevalencePagePath) {
            setPrevalenceOpen(true);
        } else {
            setPrevalenceOpen(false);
        }

        if (pathname === pageRoute.linkedDataPagePath) {
            setLinkedDataOpen(true);
        } else {
            setLinkedDataOpen(false);
        }
    });

    return (
        <header css={headerStyle}>
            <div css={mainHeaderStyle()}>
                <div css={leftHeaderStyle}>
                    <NavLink to={pageRoute.homePagePath} css={appNameStyle}>
                        ZooNotify
                    </NavLink>
                    <TranslationButtonsComponent />
                </div>
                <div css={rightHeaderStyle}>
                    <NavLink
                        to={pageRoute.infoPagePath}
                        css={navLinkStyle(infoOpen)}
                    >
                        {t("Info")}
                    </NavLink>
                    <NavLink
                        to={pageRoute.evaluationsPagePath}
                        css={navLinkStyle(evaluationsOpen)}
                    >
                        {t("Evaluations")}
                    </NavLink>
                    <NavLink
                        to={pageRoute.prevalencePagePath}
                        css={navLinkStyle(prevalenceOpen)}
                    >
                        {t("prevalence")}
                    </NavLink>
                    <NavLink
                        to={pageRoute.linkPagePath}
                        css={navLinkStyle(linkOpen)}
                    >
                        {t("Links")}
                    </NavLink>

                    <NavLink
                        to={pageRoute.prevalencePagePath}
                        css={navLinkStyle(prevalenceOpen)}
                    >
                        {t("prevalence")}
                    </NavLink>


                    {showLD && (
                        <NavLink
                            to={pageRoute.linkedDataPagePath}
                            css={navLinkStyle(linkedDataOpen)}
                        >
                            {"LD"}
                        </NavLink>
                    )}
                </div>
            </div>
        </header>
    );
}
