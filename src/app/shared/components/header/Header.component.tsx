/** @jsxImportSource @emotion/react */
import { useEffect, useState } from "react";
// eslint-disable-next-line import/named
import { SerializedStyles } from "@emotion/core";
import { css } from "@emotion/react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation, useHistory } from "react-router-dom";
import i18next from "i18next";
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
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
`;

const mainHeaderStyle = (): SerializedStyles => css`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    box-sizing: border-box;
    background-color: ${primaryColor};
    color: ${onSecondaryColor};
`;

const leftHeaderStyle = css`
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-left: 1em;
`;

const appNameStyle = css`
    font-size: 1.2rem;
    text-decoration: none;
    color: ${onPrimaryColor};
    margin-right: 1em;

    &:focus {
        outline: none;
    }
`;

const rightHeaderStyle = css`
    height: 100%;
    margin-right: 8em;
    display: flex;
    align-items: flex-end;

    @media (max-width: 768px) {
        display: none;
    }
`;

const hamburgerButtonStyle = css`
    display: none;
    background: none;
    border: none;
    color: ${onPrimaryColor};
    font-size: 1.5rem;
    cursor: pointer;
    margin-right: 1em;

    @media (max-width: 768px) {
        display: block;
    }
`;

const mobileNavStyle = (isOpen: boolean): SerializedStyles => css`
    display: ${isOpen ? "flex" : "none"};
    flex-direction: column;
    align-items: flex-start;
    background-color: #dbe4eb;
    color: #000;
    position: absolute;
    top: ${headerHeight}px;
    left: 0;
    width: 100%;
    padding: 0;
    z-index: 999;
    border: 2px solid #000;

    @media (min-width: 769px) {
        display: none;
    }
`;

const mobileNavLinkStyle = (open: boolean): SerializedStyles => css`
    padding: 0.75em 1em;
    font-size: 1rem;
    text-decoration: none;
    background-color: ${open ? secondaryColor : "transparent"};
    color: #000;
    border: 1px solid #000;
    width: 100%;

    &:focus {
        outline: none;
    }
    &:hover {
        background-color: rgba(0, 0, 0, 0.1);
    }
`;

const navLinkStyle = (open: boolean): SerializedStyles => css`
    padding: 0.5em 1em;
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

export function HeaderComponent(): JSX.Element {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [linkOpen, setLinkOpen] = useState<boolean>(false);
    const [linkedDataOpen, setLinkedDataOpen] = useState<boolean>(false);
    const [infoOpen, setInfoOpen] = useState<boolean>(false);
    const [evaluationsOpen, setEvaluationsOpen] = useState<boolean>(false);
    const [prevalenceOpen, setPrevalenceOpen] = useState<boolean>(false);
    const [microbialCountsOpen, setMicrobialCountsOpen] =
        useState<boolean>(false);
    const [antimicrobialOpen, setAntimicrobialOpen] = useState<boolean>(false);
    const [antibioticResistanceOpen, setAntibioticResistanceOpen] =
        useState<boolean>(false);

    const history = useHistory();
    const { t } = useTranslation(["Header"]);
    const showLD = process.env.REACT_APP_SHOW_LD === "true";
    const { pathname } = useLocation();

    useEffect(() => {
        setInfoOpen(pathname === pageRoute.infoPagePath);
        setLinkOpen(pathname === pageRoute.linkPagePath);
        setEvaluationsOpen(pathname === pageRoute.evaluationsPagePath);
        setPrevalenceOpen(pathname === pageRoute.prevalencePagePath);
        setAntimicrobialOpen(pathname === pageRoute.antimicrobialPagePath);
        setLinkedDataOpen(pathname === pageRoute.linkedDataPagePath);
        setMicrobialCountsOpen(pathname === pageRoute.microbialCountsPagePath);
        setAntibioticResistanceOpen(
            pathname === pageRoute.antibioticResistancePagePath
        );
        setIsMenuOpen(false);
    }, [pathname]);

    // Clicking "AntibioticResistance" should always reset to ?view=main and scroll up.
    const goToAntibioticResistanceMain = (e?: React.MouseEvent): void => {
        if (e) e.preventDefault();

        const current = new URLSearchParams(window.location.search);
        const params = new URLSearchParams();
        const micro = current.get("microorganism");
        if (micro) params.set("microorganism", micro);

        params.set("view", "main");
        params.set("lang", i18next.language);
        // do not include 's' => clears deep-link state

        setIsMenuOpen(false);
        history.push(
            `${pageRoute.antibioticResistancePagePath}?${params.toString()}`
        );

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

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
                        {t("Prevalence")}
                    </NavLink>

                    <NavLink
                        to={`${pageRoute.antibioticResistancePagePath}?view=main`}
                        css={navLinkStyle(antibioticResistanceOpen)}
                        onClick={goToAntibioticResistanceMain}
                    >
                        {t("AntibioticResistance")}
                    </NavLink>

                    <NavLink
                        to={pageRoute.microbialCountsPagePath}
                        css={navLinkStyle(microbialCountsOpen)}
                    >
                        {t("MicrobialCounts")}
                    </NavLink>
                    <NavLink
                        to={pageRoute.antimicrobialPagePath}
                        css={navLinkStyle(antimicrobialOpen)}
                    >
                        {t("antimicrobial")}
                    </NavLink>
                    <NavLink
                        to={pageRoute.linkPagePath}
                        css={navLinkStyle(linkOpen)}
                    >
                        {t("Links")}
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

                <button
                    css={hamburgerButtonStyle}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle Menu"
                >
                    &#9776;
                </button>
            </div>

            <div css={mobileNavStyle(isMenuOpen)}>
                <NavLink
                    to={pageRoute.infoPagePath}
                    css={mobileNavLinkStyle(infoOpen)}
                >
                    {t("Info")}
                </NavLink>
                <NavLink
                    to={pageRoute.evaluationsPagePath}
                    css={mobileNavLinkStyle(evaluationsOpen)}
                >
                    {t("Evaluations")}
                </NavLink>
                <NavLink
                    to={pageRoute.prevalencePagePath}
                    css={mobileNavLinkStyle(prevalenceOpen)}
                >
                    {t("Prevalence")}
                </NavLink>

                <NavLink
                    to={`${pageRoute.antibioticResistancePagePath}?view=main`}
                    css={mobileNavLinkStyle(antibioticResistanceOpen)}
                    onClick={goToAntibioticResistanceMain}
                >
                    {t("AntibioticResistance")}
                </NavLink>

                <NavLink
                    to={pageRoute.microbialCountsPagePath}
                    css={mobileNavLinkStyle(microbialCountsOpen)}
                >
                    {t("MicrobialCounts")}
                </NavLink>
                <NavLink
                    to={pageRoute.antimicrobialPagePath}
                    css={mobileNavLinkStyle(antimicrobialOpen)}
                >
                    {t("antimicrobial")}
                </NavLink>

                <NavLink
                    to={pageRoute.linkPagePath}
                    css={mobileNavLinkStyle(linkOpen)}
                >
                    {t("Links")}
                </NavLink>
                {showLD && (
                    <NavLink
                        to={pageRoute.linkedDataPagePath}
                        css={mobileNavLinkStyle(linkedDataOpen)}
                    >
                        {"LD"}
                    </NavLink>
                )}
            </div>
        </header>
    );
}
