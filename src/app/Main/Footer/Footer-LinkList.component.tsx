import React from "react";
import { Link, List, ListItem, Tooltip, Typography } from "@mui/material";
import { Box, SxProps, useTheme } from "@mui/system";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { ZNPaths } from "../../Shared/URLs";

export function FooterLinkListComponent(props: {
    supportMail: string | undefined;
}): JSX.Element {
    const { t } = useTranslation(["Footer"]);

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

    const footerElementStyle: SxProps = {
        width: "fit-content",
        padding: "0.5em",
        flex: "1 1 auto",
        listStyleType: "none",
        cursor: "pointer",
        transition: "0.3s",
        color: theme.palette.primary.main,
        "&:hover": {
            backgroundColor: "rgb(184, 191, 200)",
        },
        boxSizing: "inherit",
    };

    const footerContentStyle: SxProps = {
        margin: 0,
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        flexGrow: 1,
        textDecoration: "none",
        boxSizing: "inherit",
    };

    let submitProblemLink: JSX.Element = (
        <Link
            href={`mailto: ${
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
                <Box component="p" sx={disableLinkStyle}>
                    <Typography>{t("Content.Mail")}</Typography>
                </Box>
            </Tooltip>
        );
    }

    return (
        <List sx={footerContentStyle}>
            <ListItem sx={footerElementStyle}>
                <Link
                    href="https://www.bfr.bund.de/de/start.html"
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
            <ListItem sx={footerElementStyle}>
                <NavLink to={ZNPaths.dpdPagePath} style={linkStyle}>
                    <Typography>{t("Content.DataProtection")}</Typography>
                </NavLink>
            </ListItem>
            <ListItem sx={footerElementStyle}>{submitProblemLink}</ListItem>
        </List>
    );
}
