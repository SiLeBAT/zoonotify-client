import type { MarkdownToJSX } from "markdown-to-jsx";

export const openLinksInNewTab: MarkdownToJSX.Overrides = {
    a: {
        props: {
            target: "_blank",
            rel: "noopener noreferrer",
        },
    },
};
