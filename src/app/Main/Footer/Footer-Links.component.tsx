/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import {
    primaryColor,
    hoverColor,
} from "../../Shared/Style/Style-MainTheme.component";
import { ZNPaths, apiURL } from "../../Shared/URLs";

const footerContentStyle = css`
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    flex-grow: 1;
    text-decoration: none;
    box-sizing: inherit;
`;
const footerElementStyle = css`
    padding: 0.5em;
    display: flex;
    flex-grow: 1;
    justify-content: center;
    align-self: center;
    cursor: pointer;
    transition: 0.3s;
    color: ${primaryColor};
    &:hover {
        background-color: ${hoverColor};
    }
    box-sizing: inherit;
`;
const linkStyle = css`
    width: 100%;
    display: flex;
    justify-content: center;
    align-self: center;
    text-decoration: none;
    color: inherit;
    &:focus {
        outline: none;
    }
`;

export function FooterLinksComponent(): JSX.Element {
    const { t } = useTranslation(["Footer"]);
    return (
        <ul css={footerContentStyle}>
            <li css={footerElementStyle}>
                <a
                    href="https://www.bfr.bund.de/de/start.html"
                    target="_blank"
                    rel="noreferrer"
                    css={linkStyle}
                >
                    {t("Content.Bfr")}
                </a>
            </li>
            <li css={footerElementStyle}>
                <a
                    href="https://foodrisklabs.bfr.bund.de/foodrisk-labs/"
                    target="_blank"
                    rel="noreferrer"
                    css={linkStyle}
                >
                    FoodRisk-Labs
                </a>
            </li>
            <li css={footerElementStyle}>
                <span css={linkStyle}>
                    {t("Content.Faq")}
                </span>
            </li>
            <li css={footerElementStyle}>
                <a
                    href={apiURL}
                    target="_blank"
                    rel="noreferrer"
                    css={linkStyle}
                >
                    {t("Content.Api")}
                </a>
            </li>
            <li css={footerElementStyle}>
                <NavLink to={ZNPaths.dpdPagePath} css={linkStyle}>
                    {t("Content.DataProtection")}
                </NavLink>
            </li>
            <li css={footerElementStyle}>
                <a
                    href={`mailto: dominic.toelle@bfr.bund.de?subject=ZooNotify-Problem:&body=${t(
                        "Content.MailText"
                    )}`}
                    css={linkStyle}
                >
                    {t("Content.Mail")}
                </a>
            </li>
        </ul>
    );
}
