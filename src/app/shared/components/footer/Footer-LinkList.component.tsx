import { Link, List, ListItem, Tooltip, Typography } from "@mui/material";
import { Box, useTheme } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import {
    API_DOCUMENTATION_URL,
    pageRoute,
} from "../../infrastructure/router/routes";

export function FooterLinkListComponent(props: {
    supportMail: string | undefined;
}): JSX.Element {
    const { t, i18n } = useTranslation(["Footer"]);
    const theme = useTheme();

    const linkStyle = {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignSelf: "center",
        textDecoration: "none",
        color: "inherit",
        "&:focus": {
            outline: "none",
        },
    };

    const disableLinkStyle = {
        width: "100%",
        margin: 0,
        display: "flex",
        justifyContent: "center",
        alignSelf: "center",
        color: "gray",
    };

    const footerElementStyle = {
        width: "fit-content",
        padding: "0.5em",
        flex: "1 1 auto",
        listStyleType: "none",
        cursor: "pointer",
        transition: "0.3s",
        color: theme.palette.primary.main,
        "&:hover": {
            backgroundColor: theme.palette.secondary.main,
        },
        boxSizing: "inherit",
    };

    const footerContentStyle = {
        margin: 0,
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        flexGrow: 1,
        textDecoration: "none",
        boxSizing: "inherit",
        padding: "0",
    };

    let submitProblemLink: JSX.Element = (
        <Link
            href={`mailto:${
                props.supportMail
            }?subject=ZooNotify-Problem:&body=${t("Content.MailText")}`}
            sx={linkStyle}
        >
            <Typography>{t("Content.Mail")}</Typography>
        </Link>
    );

    if (props.supportMail === undefined) {
        const supportMailErrorText = t("Content.SupportError");
        submitProblemLink = (
            <Tooltip
                sx={{
                    backgroundColor: "transparent",
                    color: theme.palette.error.main,
                    fontSize: "9px",
                    paddingRight: 0,
                }}
                title={supportMailErrorText}
                placement="top"
            >
                <Box sx={disableLinkStyle}>
                    <Typography>{t("Content.Mail")}</Typography>
                </Box>
            </Tooltip>
        );
    }

    const apiDocumentationUrl = API_DOCUMENTATION_URL;

    // Determine BfR link based on the current language.
    const bfrLink =
        i18n.language === "en"
            ? "https://www.bfr.bund.de/en/home.html"
            : "https://www.bfr.bund.de/de/start.html";

    return (
        <List sx={footerContentStyle}>
            <ListItem sx={footerElementStyle}>
                <Link
                    href={bfrLink}
                    target="_blank"
                    rel="noreferrer"
                    sx={linkStyle}
                >
                    <Typography>{t("Content.Bfr")}</Typography>
                </Link>
            </ListItem>
            <ListItem sx={footerElementStyle}>
                <Link
                    href="https://foodrisklabs.bfr.bund.de/foodrisk-labs/"
                    target="_blank"
                    rel="noreferrer"
                    sx={linkStyle}
                >
                    <Typography>FoodRisk-Labs</Typography>
                </Link>
            </ListItem>
            {
                <ListItem sx={footerElementStyle}>
                    <Link
                        href={apiDocumentationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={linkStyle}
                    >
                        <Typography>{t("Content.Api")}</Typography>
                    </Link>
                </ListItem>
            }
            <ListItem sx={footerElementStyle}>
                <NavLink to={pageRoute.dpdPagePath} style={linkStyle}>
                    <Typography>{t("Content.DataProtection")}</Typography>
                </NavLink>
            </ListItem>
            <ListItem sx={footerElementStyle}>{submitProblemLink}</ListItem>
        </List>
    );
}
