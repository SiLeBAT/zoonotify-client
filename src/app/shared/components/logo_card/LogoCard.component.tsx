import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { primaryColor } from "../../style/Style-MainTheme";
import { LogoComponent } from "./Logo.component";

export interface CardProps {
    title: string;
    subtitle: string;
    text: React.ReactNode; // Change the type to React.ReactNode
}

/**
 * @desc Returns a card wrapper with BfR-Logo
 * @param props
 * @returns {JSX.Element} - card with title, subtitle, text and BfR-Logo
 */
export function LogoCardComponent(props: CardProps): JSX.Element {
    return (
        <Card
            sx={{
                padding: "1em",
                margin: "2.5em auto",
                width: "50%",
            }}
        >
            <CardContent>
                <Typography
                    variant="h1"
                    sx={{
                        marginBottom: "1rem",
                        fontSize: "3rem",
                        textAlign: "center",
                        fontWeight: "normal",
                        color: `${primaryColor}`,
                    }}
                >
                    {props.title}
                </Typography>
                <Typography
                    sx={{
                        margin: "1em 0",
                        fontSize: "0.85rem",
                        textAlign: "center",
                    }}
                >
                    {props.subtitle}
                </Typography>
                <div
                    style={{
                        fontSize: "0.85rem",
                        lineHeight: "1.6",
                        textAlign: "justify",
                    }}
                >
                    {props.text}
                </div>
            </CardContent>
            <LogoComponent></LogoComponent>
        </Card>
    );
}
