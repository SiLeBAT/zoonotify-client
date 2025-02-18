/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import React, { useState } from "react";
import { FooterContainer } from "../footer/Footer-Container.component";
import { HeaderComponent } from "../header/Header.component";
import { ErrorSnackbar } from "../ErrorSnackbar/ErrorSnackbar";

const layoutWrapperStyle = css`
    display: flex;
    flex-direction: column;
    height: 100%;
    z-index: 0;
    min-height: 100vh;
    box-sizing: border-box;
`;

const headerStyle = css`
    z-index: 1;
`;

const mainStyle = css`
    flex: 1;
    z-index: 0;
    overflow-x: hidden;
    overflow-y: hidden;
    box-sizing: border-box;

    @media (max-width: 1000px) {
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }
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
