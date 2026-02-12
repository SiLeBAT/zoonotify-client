import React from "react";
import { Box } from "@mui/material";
import { LogoCardComponent } from "../../shared/components/logo_card/LogoCard.component";
import { useWelcomePageComponent } from "./welcomeUseCase";
import Markdown from "markdown-to-jsx";
import { PageLayoutComponent } from "../../shared/components/layout/PageLayoutComponent";

// Note: Add global CSS to src/index.css or src/App.css
// html, body {
//     margin: 0;
//     padding: 0;
//     height: 100%;
//     overflow: hidden;
// }

export function WelcomeMainComponent(): JSX.Element {
    const { model } = useWelcomePageComponent(null);

    return (
        <PageLayoutComponent>
            {/* Root container */}
            <Box
                sx={{
                    height: "100vh",
                    width: "100vw",
                    overflowY: "hidden", // Prevent outer scrollbar
                    display: "flex",
                    flexDirection: "column",
                    boxSizing: "border-box",
                    // Mobile: use taller container
                    "@media (max-width: 600px)": {
                        height: "330vh",
                    },
                }}
            >
                {/* Scrollable content area */}
                <Box
                    sx={{
                        flex: 1, // Take available space
                        overflowY: "auto", // Allow scrolling for content
                        padding: "1rem",
                        // Mobile styles via media query
                        "@media (max-width: 800px)": {
                            padding: "0.5rem",
                        },
                    }}
                >
                    {/* Wrapper for LogoCardComponent styling */}
                    <Box
                        sx={{
                            maxWidth: "100%", // Prevent overflow
                            boxSizing: "border-box",
                            "@media (max-width: 600px)": {
                                fontSize: "0.9rem", // Smaller text on mobile
                            },
                        }}
                    >
                        <LogoCardComponent
                            title="ZooNotify"
                            subtitle={model.subtitle}
                            text={
                                <Markdown
                                    options={{
                                        overrides: {
                                            a: {
                                                props: {
                                                    target: "_blank",
                                                    rel: "noopener noreferrer",
                                                },
                                            },
                                            img: {
                                                props: {
                                                    style: {
                                                        maxWidth: "100%",
                                                        height: "auto",
                                                    },
                                                },
                                            },
                                            table: {
                                                props: {
                                                    style: {
                                                        maxWidth: "100%",
                                                        overflowX: "auto",
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                >
                                    {model.content}
                                </Markdown>
                            }
                        />
                    </Box>
                </Box>
            </Box>
        </PageLayoutComponent>
    );
}
