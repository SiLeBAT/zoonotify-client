/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import React, { useState } from "react";
import { FooterContainer } from "../footer/Footer-Container.component";
import { HeaderComponent } from "../header/Header.component";
import { ErrorSnackbar } from "../ErrorSnackbar/ErrorSnackbar";

// Wrapper: no fixed height or forced 100vh
const layoutWrapperStyle = css`
    //display: flex;
    flex-direction: column;
    box-sizing: border-box;
    overflow-y: hidden;
`;

// Keep the header above other elements
const headerStyle = css`
    z-index: 1;
`;

// Main content can scroll freely
const mainStyle = css`
    flex: 1;
    z-index: 0;
    box-sizing: border-box;

    /* Let the browser handle scrolling */
    overflow-x: hidden;
    overflow-y: hidden;
`;

const footerStyle = css`
    z-index: 1;
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
            <header css={headerStyle}>
                <HeaderComponent />
            </header>

            <main css={mainStyle}>{children}</main>

            <footer css={footerStyle}>
                <FooterContainer />
            </footer>

            <ErrorSnackbar
                open={snackbarOpen}
                handleClose={handleSnackbarClose}
            />
        </div>
    );
};
