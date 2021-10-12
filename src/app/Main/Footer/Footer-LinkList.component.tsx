/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Tooltip, withStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import {
    primaryColor,
    hoverColor,
    errorColor
} from "../../Shared/Style/Style-MainTheme.component";
import { ZNPaths } from "../../Shared/URLs";

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
    flex: 1 1 auto;
    list-style-type: none;
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
const disableLinkStyle = css`
    width: 100%;
    margin: 0;
    display: flex;
    justify-content: center;
    align-self: center;
    color: gray;
`;

const LightTooltip = withStyles(() => ({
    tooltip: {
        backgroundColor: "transparent",
        color: errorColor,
        fontSize: "9px",
        paddingRight: 0,
    },
}))(Tooltip);

export function FooterLinkListComponent(props: {
    supportMail: string | undefined;
}): JSX.Element {
    const { t } = useTranslation(["Footer"]);

    let submitProblemLink: JSX.Element = (
        <a
            href={`mailto: ${
                props.supportMail
            }?subject=ZooNotify-Problem:&body=${t("Content.MailText")}`}
            css={linkStyle}
        >
            {t("Content.Mail")}
        </a>
    );

    if (props.supportMail === undefined) {
        const supportMailErrorText = t("Content.SupportError")
        submitProblemLink = (
            <LightTooltip title={supportMailErrorText} placement="top">
                <p css={disableLinkStyle}>{t("Content.Mail")}</p>
            </LightTooltip>
        );
    }

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
                <NavLink to={ZNPaths.dpdPagePath} css={linkStyle}>
                    {t("Content.DataProtection")}
                </NavLink>
            </li>
            <li css={footerElementStyle}>{submitProblemLink}</li>
        </ul>
    );
}
