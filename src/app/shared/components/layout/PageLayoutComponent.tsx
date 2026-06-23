/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import React, { useState } from "react";
import { ErrorSnackbar } from "../ErrorSnackbar/ErrorSnackbar";

// The page fills the body slot handed down by MainLayout (between the global
// header and footer) and owns its scrolling via main. The footer now lives in
// MainLayout as a sibling of the header, so it is not part of this component.
const layoutWrapperStyle = css`
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;

    overflow: hidden;
`;

// Main is the page's scroll container. min-height: 0 lets it shrink inside the
// flex column so it scrolls instead of overflowing. Pages that bring their own
// scrollable panes (e.g. prevalence's sidebar + results) simply fill it.
const mainStyle = css`
    flex: 1 1 0;
    min-height: 0;
    z-index: 0;
    box-sizing: border-box;

    overflow-x: hidden;
    overflow-y: auto;
`;

interface PageLayoutProps {
    children: React.ReactNode;
}

export const PageLayoutComponent: React.FC<PageLayoutProps> = ({
    children,
}): JSX.Element => {
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleSnackbarClose = (): void => {
        setSnackbarOpen(false);
    };

    return (
        <div css={layoutWrapperStyle}>
            <main css={mainStyle}>{children}</main>

            <ErrorSnackbar
                open={snackbarOpen}
                handleClose={handleSnackbarClose}
            />
        </div>
    );
};
