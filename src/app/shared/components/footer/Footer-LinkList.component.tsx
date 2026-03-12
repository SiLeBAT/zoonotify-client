import React from "react";
import { Link, List, ListItem, Tooltip, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { pageRoute } from "../../infrastructure/router/routes";

export function FooterLinkListComponent(props: {
    supportMail: string | undefined;
}): JSX.Element {
    const { t } = useTranslation(["Footer"]);
    const theme = useTheme();

    // Reduced font size & line-height to make text more compact
    const linkStyle = {
        width: "100%",
        textDecoration: "none",
        color: "inherit",
        display: "flex",
        justifyContent: "center",
        "&:focus": {
            outline: "none",
        },
        fontSize: "0.85rem", // <--- Decrease as needed
        lineHeight: 1.2, // <--- Decrease as needed
    };

    const disableLinkStyle = {
        width: "100%",
        margin: 0,
        display: "flex",
        justifyContent: "center",
        color: "gray",
        fontSize: "0.85rem",
        lineHeight: 1.2,
    };

    // Reduced padding so each list item is more compact
    const footerElementStyle = {
        width: "fit-content",
        padding: "0.3em", // <--- Decrease top/bottom padding
        flex: "1 1 auto",
        listStyleType: "none",
        cursor: "pointer",
        color: theme.palette.primary.main,
        transition: "0.3s",
        "&:hover": {
            backgroundColor: theme.palette.secondary.main,
        },
    };

    // Row layout for desktop; column for mobile
    const footerContentStyle = {
        margin: 0,
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        flexGrow: 1,
        padding: 0,
        [theme.breakpoints.down("sm")]: {
            flexDirection: "column",
            alignItems: "center",
            flexWrap: "nowrap",
            "& .MuiListItem-root": {
                width: "100%",
                justifyContent: "center",
                textAlign: "center",
                paddingTop: 0, // Remove extra ListItem padding on mobile
                paddingBottom: 0, // Remove extra ListItem padding on mobile
            },
        },
    };

    // Build the "Submit a Problem" link
    let submitProblemLink: JSX.Element = (
        <Link
            href={`mailto:${props.supportMail}?subject=ZooNotify-Problem`}
            sx={linkStyle}
        >
            <Typography sx={{ fontSize: "inherit", lineHeight: "inherit" }}>
                {t("Content.Mail")}
            </Typography>
        </Link>
    );

    if (!props.supportMail) {
        const supportMailErrorText = t("Content.SupportError");
        submitProblemLink = (
            <Tooltip
                title={supportMailErrorText}
                placement="top"
                sx={{
                    backgroundColor: "transparent",
                    color: theme.palette.error.main,
                }}
            >
                <Box sx={disableLinkStyle}>
                    <Typography
                        sx={{ fontSize: "inherit", lineHeight: "inherit" }}
                    >
                        {t("Content.Mail")}
                    </Typography>
                </Box>
            </Tooltip>
        );
    }

    return (
        <List sx={footerContentStyle} disablePadding>
            <ListItem sx={footerElementStyle}>
                <Link
                    href="https://www.bfr.bund.de/en/home.html"
                    sx={linkStyle}
                >
                    <Typography
                        sx={{ fontSize: "inherit", lineHeight: "inherit" }}
                    >
                        {t("Content.Bfr")}
                    </Typography>
                </Link>
            </ListItem>
            <ListItem sx={footerElementStyle}>
                <Link
                    href="https://foodrisklabs.bfr.bund.de/foodrisk-labs/"
                    sx={linkStyle}
                >
                    <Typography
                        sx={{ fontSize: "inherit", lineHeight: "inherit" }}
                    >
                        FoodRisk-Labs
                    </Typography>
                </Link>
            </ListItem>
            <ListItem sx={footerElementStyle}>
                <NavLink to={pageRoute.dpdPagePath} style={linkStyle}>
                    <Typography
                        sx={{ fontSize: "inherit", lineHeight: "inherit" }}
                    >
                        {t("Content.DataProtection")}
                    </Typography>
                </NavLink>
            </ListItem>
            <ListItem sx={footerElementStyle}>{submitProblemLink}</ListItem>
        </List>
    );
}
