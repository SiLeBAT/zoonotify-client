import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { LogoComponent } from "./Logo.component";

export interface CardProps {
    title: string;
    subtitle: string;
    text: React.ReactNode;
}

export function LogoCardComponent(props: CardProps): JSX.Element {
    return (
        <Card
            // Keep a shadow on desktop by default (e.g., elevation 3)
            elevation={3}
            sx={{
                // Desktop styles:
                // (The Card will use the default MUI shadow for elevation={3})
                backgroundColor: "#dbe4eb",
                color: "#000",
                padding: "1em",
                margin: "2.5em auto",
                width: "50%",

                // Mobile overrides (max-width: 768px):
                "@media (max-width: 800px)": {
                    // Adjust layout for mobile
                    width: "90%",
                    margin: "1em auto",
                    backgroundColor: "#fff",
                    color: "#000",

                    // Remove the shadow/border on mobile
                    boxShadow: "none !important",
                    border: "none !important",
                },
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
                        color: "#000",
                    }}
                >
                    {props.title}
                </Typography>

                <Typography
                    sx={{
                        margin: "1em 0",
                        fontSize: "0.85rem",
                        textAlign: "center",
                        color: "#000",
                    }}
                >
                    {props.subtitle}
                </Typography>

                <div
                    style={{
                        fontSize: "0.85rem",
                        lineHeight: "1.6",
                        textAlign: "justify",
                        color: "#000",
                    }}
                >
                    {props.text}
                </div>
            </CardContent>

            <LogoComponent />
        </Card>
    );
}
