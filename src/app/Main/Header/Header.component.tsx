/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExportDataComponent } from "./Header-Export.component";
import { TranslationButtonsComponent as TranslationButtons } from "./TranslationButtons.component";
import {
    primaryColor,
    onPrimaryColor,
    secondaryColor,
    bfrPrimaryPalette,
} from "../../Shared/Style/Style-MainTheme.component";
import { queryPageURL, homePageURL } from "../../Shared/URLs";

const headerStyle = css`
    width: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
`;
const mainHeaderStyle = css`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
    box-sizing: border-box;
    box-shadow: 0 2px 6px 0 grey;
    background-color: ${primaryColor};
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

const queryStyle = (open: boolean): SerializedStyles => css`
    margin-right: 8em;
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

export function HeaderLayoutComponent(): JSX.Element {
    const [open, setOpen] = useState<boolean>(false);
    const { t } = useTranslation(["Header"]);

    const { pathname } = useLocation();
    useEffect(() => {
        if (pathname === queryPageURL) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    });

    return (
        <header css={headerStyle}>
            <div css={mainHeaderStyle}>
                <div css={leftHeaderStyle}>
                    <NavLink to={homePageURL} css={appNameStyle}>
                        ZooNotify
                    </NavLink>
                    <TranslationButtons />
                </div>
                <NavLink to={queryPageURL} css={queryStyle(open)}>
                    {t("Query")}
                </NavLink>
            </div>

            <div css={subheaderStyle(open)}>
                <ExportDataComponent />
            </div>
        </header>
    );
}
