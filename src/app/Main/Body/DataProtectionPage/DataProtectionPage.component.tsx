/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { primaryColor } from "../../../Shared/Style/Style-MainTheme.component";
import { ZNPaths } from "../../../Shared/URLs";
import { contactBfr, contactDP, homePageBfr, linkBDSG, linkDSGVO, mailBfr, mailDP, mailZnSupport } from "./DataProtection.config";

const dataProtectionStyle = css`
    max-width: 90ch;
    min-width: 241px;
    margin-left: auto;
    margin-right: auto;
    padding: 8px 75px;
    overflow: auto;
    text-align: justify;
    line-height: 1.6;
`;
const dataProtectionMainHeaderStyle = css`
    margin-top: 3%;
    padding-bottom: 1.5%;
    text-align: center;
    font-weight: normal;
    border-bottom: 1px solid ${primaryColor};
`;
const dataProtectionHeaderStyle = css`
    margin-top: 3%;
    font-weight: bold;
    text-align: center;
`;
const dataProtectionSubheaderStyle = css`
    font-weight: bold;
    text-align: center;
`;
const dataProtectionFooterStyle = css`
    border-top: 1px solid ${primaryColor};
`;
const dataProtectionFooterDateStyle = css`
    font-size: 0.75em;
`;
const dataProtectionListStyle = css`
    list-style-type: lower-alpha;
`;

export function DataProtectionPageComponent(): JSX.Element {
    const { t } = useTranslation(["DataProtection"]);
    return (
        <article css={dataProtectionStyle}>
            <h1 css={dataProtectionMainHeaderStyle}>{t("Heading")}</h1>
            <p>
                {t("Description.DescriptionText1")}
                <a href={ZNPaths.homePagePath}>
                    {t("Description.DescriptionLink")}
                </a>
                {t("Description.DescriptionText2")}
            </p>

            <h3 css={dataProtectionHeaderStyle}>{t("Chapter.1.Heading")}</h3>
            <div>
                <p>{t("Chapter.1.Text1")}</p>
                <table>
                    <tbody>
                        <tr>{t("Chapter.1.BfrName")}</tr>
                        <tr>{contactBfr.Street}</tr>
                        <tr>{contactBfr.City}</tr>
                        <tr>{contactBfr.Phone}</tr>
                        <tr>{contactBfr.Fax}</tr>
                        <tr>
                            {t("Chapter.1.MailText")}
                            <a href={`mailto:${mailBfr}`}>
                                {mailBfr}
                            </a>
                        </tr>
                        <tr>
                            <a
                                href={homePageBfr}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {homePageBfr}
                            </a>
                        </tr>
                    </tbody>
                </table>
                <br />
                <p> {t("Chapter.1.Text2")} </p>
                <table>
                    <tbody>
                        <tr>{contactDP.Name}</tr>
                        <tr>{contactDP.Street}</tr>
                        <tr>{contactDP.City}</tr>
                        <tr>{contactDP.Phone}</tr>
                        <tr>{contactDP.Fax}</tr>
                        <tr>
                            {t("Chapter.1.MailText")}
                            <a href={`mailto:${mailDP}`}>
                                {mailDP}
                            </a>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3 css={dataProtectionHeaderStyle}>{t("Chapter.2.Heading")}</h3>
            <div>
                <p>
                    {t("Chapter.2.Text1")}
                    <a
                        href={linkDSGVO}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {t("Chapter.2.LinkDSGVO")}
                    </a>
                    {t("Chapter.2.Text2")}
                    <a
                        href={linkBDSG}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {t("Chapter.2.LinkBDSG")}
                    </a>
                </p>
                <p>{t("Chapter.2.Text3")}</p>
                <p>{t("Chapter.2.Text4")}</p>
                <p>{t("Chapter.2.Text5")}</p>
                <p>{t("Chapter.2.Text6")}</p>
                <p>{t("Chapter.2.Text7")}</p>
                <p>{t("Chapter.2.Text8")}</p>
            </div>

            <h3 css={dataProtectionHeaderStyle}>{t("Chapter.3.Heading")}</h3>
            <h4 css={dataProtectionSubheaderStyle}>
                {t("Chapter.3.31.Heading")}
            </h4>
            <div>
                <p>{t("Chapter.3.31.Text1")}</p>
                <ul css={dataProtectionListStyle}>
                    <li>{t("Chapter.3.31.Data.a")}</li>
                    <li>{t("Chapter.3.31.Data.b")}</li>
                    <li>{t("Chapter.3.31.Data.c")}</li>
                    <li>{t("Chapter.3.31.Data.d")}</li>
                    <li>{t("Chapter.3.31.Data.e")}</li>
                    <li>{t("Chapter.3.31.Data.f")}</li>
                </ul>
                <p>{t("Chapter.3.31.Text2")}</p>
                <p>{t("Chapter.3.31.Text3")}</p>
                <ul css={dataProtectionListStyle}>
                    <li>{t("Chapter.3.31.Reasons.a")}</li>
                    <li>{t("Chapter.3.31.Reasons.b")}</li>
                    <li>{t("Chapter.3.31.Reasons.c")}</li>
                </ul>
                <p>{t("Chapter.3.31.Text4")}</p>
            </div>

            <h4 css={dataProtectionSubheaderStyle}>
                {t("Chapter.3.32.Heading")}
            </h4>
            <div>
                <p>
                    {t("Chapter.3.32.Text1")}{" "}
                    <a href={`mailto:${mailZnSupport}`}>
                        {mailZnSupport}
                    </a>
                    {t("Chapter.3.32.Text2")}
                </p>
            </div>

            <h3 css={dataProtectionHeaderStyle}>{t("Chapter.4.Heading")}</h3>
            <div>
                <p>{t("Chapter.4.Text")}</p>
            </div>

            <h3 css={dataProtectionHeaderStyle}>{t("Chapter.5.Heading")}</h3>
            <div>
                <p>{t("Chapter.5.Text1")}</p>
                <ul css={dataProtectionListStyle}>
                    <li>{t("Chapter.5.Rights.a")}</li>
                    <li>{t("Chapter.5.Rights.b")}</li>
                    <li>{t("Chapter.5.Rights.c")}</li>
                    <li>{t("Chapter.5.Rights.d")}</li>
                    <li>{t("Chapter.5.Rights.e")}</li>
                    <li>{t("Chapter.5.Rights.f")}</li>
                </ul>
                <p>{t("Chapter.5.Text2")}</p>
                <p>{t("Chapter.5.Text3")}</p>
                <p>{t("Chapter.5.Text4")}</p>
                <p>{t("Chapter.5.Text5")}</p>
                <p>
                    {t("Chapter.5.Text6")}
                    <a href={`mailto:${mailDP}`}>
                        {mailDP}
                    </a>
                    {t("Chapter.5.Text7")}
                </p>
            </div>

            <h3 css={dataProtectionHeaderStyle}>{t("Chapter.6.Heading")}</h3>
            <div>
                <p>{t("Chapter.6.Text")}</p>
            </div>

            <footer css={dataProtectionFooterStyle}>
                <span css={dataProtectionFooterDateStyle}>
                    {t("CreationDate.Text")}
                    <time>{t("CreationDate.Date")}</time>
                </span>
            </footer>
        </article>
    );
}
