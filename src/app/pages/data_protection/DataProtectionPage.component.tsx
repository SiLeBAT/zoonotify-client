import { Link, List, ListItem, Typography } from "@mui/material";
import { Box, useTheme } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import { pageRoute } from "../../shared/infrastructure/router/routes";
import {
    contactBfr,
    contactDP,
    homePageBfr,
    linkBDSG,
    linkDSGVO,
    mailBfr,
    mailDP,
    mailZnSupport,
} from "./DataProtection.config";

const dataProtectionHeaderStyle = {
    margin: "1em 0",
    fontSize: "1rem",
    fontWeight: "bold",
    textAlign: "center",
} as const;

const dataProtectionSubheaderStyle = {
    margin: "0.5em",
    fontWeight: "bold",
    textAlign: "center",
} as const;

const paragraphStyle = {
    padding: "0.5em 0",
} as const;

const listStyle = {
    listStyleType: "lower-alpha",
    marginLeft: "2em",
    lineHeight: 1.8,
} as const;

const listItemStyle = {
    display: "list-item",
    padding: 0,
} as const;

export function DataProtectionPageComponent(): JSX.Element {
    const theme = useTheme();
    const { t } = useTranslation(["DataProtection"]);

    const linkColorStyle = {
        color: theme.palette.primary.main,
    };

    return (
        <Box
            sx={{
                maxWidth: "90ch",
                minWidth: "241px",
                textAlign: "justify",
                margin: "2em auto",
            }}
        >
            <Typography
                variant="h1"
                sx={{
                    marginBottom: "1rem",
                    paddingBottom: "0.5em",
                    fontSize: "3rem",
                    textAlign: "center",
                    fontWeight: "normal",
                    color: theme.palette.primary.main,
                    borderBottom: `1px solid ${theme.palette.primary.main}`,
                }}
            >
                {t("Heading")}
            </Typography>
            <Typography component="p" sx={paragraphStyle}>
                {t("Description.DescriptionText1")}
                <Link href={pageRoute.homePagePath} sx={linkColorStyle}>
                    {t("Description.DescriptionLink")}
                </Link>
                {t("Description.DescriptionText2")}
            </Typography>

            <Typography variant="h6" sx={dataProtectionHeaderStyle}>
                {t("Chapter.1.Heading")}
            </Typography>
            <div>
                <Typography component="p" sx={paragraphStyle}>
                    {t("Chapter.1.Text1")}
                </Typography>
                <List dense>
                    <ListItem>{t("Chapter.1.BfrName")}</ListItem>
                    <ListItem>{contactBfr.Street}</ListItem>
                    <ListItem>{contactBfr.City}</ListItem>
                    <ListItem>{contactBfr.Phone}</ListItem>
                    <ListItem>{contactBfr.Fax}</ListItem>
                    <ListItem>
                        {t("Chapter.1.MailText")}
                        <Link href={`mailto:${mailBfr}`} sx={linkColorStyle}>
                            {mailBfr}
                        </Link>
                    </ListItem>
                    <ListItem>
                        <Link
                            href={homePageBfr}
                            target="_blank"
                            rel="noreferrer"
                            sx={linkColorStyle}
                        >
                            {homePageBfr}
                        </Link>
                    </ListItem>
                </List>
                <br />
                <Typography component="p" sx={paragraphStyle}>
                    {" "}
                    {t("Chapter.1.Text2")}{" "}
                </Typography>
                <List dense>
                    <ListItem>{contactDP.Name}</ListItem>
                    <ListItem>{contactDP.Street}</ListItem>
                    <ListItem>{contactDP.City}</ListItem>
                    <ListItem>{contactDP.Phone}</ListItem>
                    <ListItem>{contactDP.Fax}</ListItem>
                    <ListItem>
                        {t("Chapter.1.MailText")}
                        <Link href={`mailto:${mailDP}`} sx={linkColorStyle}>
                            {mailDP}
                        </Link>
                    </ListItem>
                </List>
            </div>

            <Typography variant="h6" sx={dataProtectionHeaderStyle}>
                {t("Chapter.2.Heading")}
            </Typography>
            <div>
                <Typography component="p" sx={paragraphStyle}>
                    {t("Chapter.2.Text1")}
                    <Link
                        href={linkDSGVO}
                        target="_blank"
                        rel="noreferrer"
                        sx={linkColorStyle}
                    >
                        {t("Chapter.2.LinkDSGVO")}
                    </Link>
                    {t("Chapter.2.Text2")}
                    <Link
                        href={linkBDSG}
                        target="_blank"
                        rel="noreferrer"
                        sx={linkColorStyle}
                    >
                        {t("Chapter.2.LinkBDSG")}
                    </Link>
                </Typography>
                <Typography component="p" sx={paragraphStyle}>
                    {t("Chapter.2.Text3")}
                </Typography>
                <Typography component="p" sx={paragraphStyle}>
                    {t("Chapter.2.Text4")}
                </Typography>
                <Typography component="p" sx={paragraphStyle}>
                    {t("Chapter.2.Text5")}
                </Typography>
                <Typography component="p" sx={paragraphStyle}>
                    {t("Chapter.2.Text6")}
                </Typography>
                <Typography component="p" sx={paragraphStyle}>
                    {t("Chapter.2.Text7")}
                </Typography>
                <Typography component="p" sx={paragraphStyle}>
                    {t("Chapter.2.Text8")}
                </Typography>
            </div>

            <Typography variant="h6" sx={dataProtectionHeaderStyle}>
                {t("Chapter.3.Heading")}
            </Typography>
            <Typography sx={dataProtectionSubheaderStyle}>
                {t("Chapter.3.31.Heading")}
            </Typography>
            <div>
                <Typography component="p" sx={paragraphStyle}>
                    {t("Chapter.3.31.Text1")}
                </Typography>
                <List dense sx={listStyle}>
                    <ListItem sx={listItemStyle}>
                        {t("Chapter.3.31.Data.a")}
                    </ListItem>
                    <ListItem sx={listItemStyle}>
                        {t("Chapter.3.31.Data.b")}
                    </ListItem>
                    <ListItem sx={listItemStyle}>
                        {t("Chapter.3.31.Data.c")}
                    </ListItem>
                    <ListItem sx={listItemStyle}>
                        {t("Chapter.3.31.Data.d")}
                    </ListItem>
                    <ListItem sx={listItemStyle}>
                        {t("Chapter.3.31.Data.e")}
                    </ListItem>
                    <ListItem sx={listItemStyle}>
                        {t("Chapter.3.31.Data.f")}
                    </ListItem>
                </List>
                <Typography component="p" sx={paragraphStyle}>
                    {t("Chapter.3.31.Text2")}
                </Typography>
                <Typography component="p" sx={paragraphStyle}>
                    {t("Chapter.3.31.Text3")}
                </Typography>
                <List dense sx={listStyle}>
                    <ListItem sx={listItemStyle}>
                        {t("Chapter.3.31.Reasons.a")}
                    </ListItem>
                    <ListItem sx={listItemStyle}>
                        {t("Chapter.3.31.Reasons.b")}
                    </ListItem>
                    <ListItem sx={listItemStyle}>
                        {t("Chapter.3.31.Reasons.c")}
                    </ListItem>
                </List>
                <Typography component="p" sx={paragraphStyle}>
                    {t("Chapter.3.31.Text4")}
                </Typography>
            </div>

            <Typography sx={dataProtectionSubheaderStyle}>
                {t("Chapter.3.32.Heading")}
            </Typography>
            <div>
                <Typography component="p" sx={paragraphStyle}>
                    {t("Chapter.3.32.Text1")}{" "}
                    <Link href={`mailto:${mailZnSupport}`} sx={linkColorStyle}>
                        {mailZnSupport}
                    </Link>
                    {t("Chapter.3.32.Text2")}
                </Typography>
            </div>

            <Typography variant="h6" sx={dataProtectionHeaderStyle}>
                {t("Chapter.4.Heading")}
            </Typography>
            <div>
                <Typography component="p" sx={paragraphStyle}>
                    {t("Chapter.4.Text")}
                </Typography>
            </div>

            <Typography variant="h6" sx={dataProtectionHeaderStyle}>
                {t("Chapter.5.Heading")}
            </Typography>
            <div>
                <Typography component="p" sx={paragraphStyle}>
                    {t("Chapter.5.Text1")}
                </Typography>
                <List dense sx={listStyle}>
                    <ListItem sx={listItemStyle}>
                        {t("Chapter.5.Rights.a")}
                    </ListItem>
                    <ListItem sx={listItemStyle}>
                        {t("Chapter.5.Rights.b")}
                    </ListItem>
                    <ListItem sx={listItemStyle}>
                        {t("Chapter.5.Rights.c")}
                    </ListItem>
                    <ListItem sx={listItemStyle}>
                        {t("Chapter.5.Rights.d")}
                    </ListItem>
                    <ListItem sx={listItemStyle}>
                        {t("Chapter.5.Rights.e")}
                    </ListItem>
                    <ListItem sx={listItemStyle}>
                        {t("Chapter.5.Rights.f")}
                    </ListItem>
                </List>
                <Typography component="p" sx={paragraphStyle}>
                    {t("Chapter.5.Text2")}
                </Typography>
                <Typography component="p" sx={paragraphStyle}>
                    {t("Chapter.5.Text3")}
                </Typography>
                <Typography component="p" sx={paragraphStyle}>
                    {t("Chapter.5.Text4")}
                </Typography>
                <Typography component="p" sx={paragraphStyle}>
                    {t("Chapter.5.Text5")}
                </Typography>
                <Typography component="p" sx={paragraphStyle}>
                    {t("Chapter.5.Text6")}
                    <Link href={`mailto:${mailDP}`} sx={linkColorStyle}>
                        {mailDP}
                    </Link>
                    {t("Chapter.5.Text7")}
                </Typography>
            </div>

            <Typography variant="h6" sx={dataProtectionHeaderStyle}>
                {t("Chapter.6.Heading")}
            </Typography>
            <div>
                <Typography component="p" sx={paragraphStyle}>
                    {t("Chapter.6.Text")}
                </Typography>
            </div>

            <Box
                component="footer"
                sx={{
                    width: "100%",
                    borderTop: `1px solid ${theme.palette.primary.main}`,
                }}
            >
                <Typography variant="caption">
                    {t("CreationDate.Text")}
                    <time>{t("CreationDate.Date")}</time>
                </Typography>
            </Box>
        </Box>
    );
}
