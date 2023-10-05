import { Button, Divider } from "@mui/material";
import { useTheme } from "@mui/system";
import Markdown from "markdown-to-jsx";
import React from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MyEvent = any;
export function ExplanationTermComponent(props: {
    handleOpen: (id: string) => void;
    description: string;
}): JSX.Element {
    const theme = useTheme();

    return (
        <Markdown
            options={{
                overrides: {
                    br: {
                        component: Divider,
                        props: {
                            variant: "middle",
                            sx: {
                                background: theme.palette.primary.main,
                                width: "50%",
                                margin: "1em auto",
                            },
                        },
                    },
                    table: {
                        component: Button,
                        props: {
                            onClick: (e: MyEvent) => {
                                e.preventDefault();
                                const id =
                                    e.target.id || e.target.parentElement.id;
                                props.handleOpen(id);
                            },
                            sx: {
                                color: theme.palette.primary.main,
                                backgroundColor:
                                    theme.palette.primary.contrastText,
                                "&:hover": {
                                    backgroundColor:
                                        theme.palette.secondary.main,
                                    textDecoration: "underline",
                                },
                                margin: "1rem",
                            },
                        },
                    },
                },
            }}
        >
            {props.description}
        </Markdown>
    );
}
