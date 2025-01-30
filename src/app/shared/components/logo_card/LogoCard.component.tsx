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
            sx={{
                // Desktop: Use the extracted blue color
                backgroundColor: "#dbe4eb",
                color: "#000", // Text color for contrast
                padding: "1em",
                margin: "2.5em auto",
                width: "50%",

                // Mobile: White background with black text
                "@media (max-width: 768px)": {
                    width: "90%",
                    margin: "1em auto",
                    backgroundColor: "#fff",
                    color: "#000",
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
                        color: "#000", // Black text for better readability
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
