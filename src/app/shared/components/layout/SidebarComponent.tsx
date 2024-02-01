import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import { Box, Collapse, IconButton, Typography, styled } from "@mui/material";
import React from "react";
import { backgroundColor, primaryColor } from "../../style/Style-MainTheme";

const StyledBox = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    color: theme.palette.text.secondary,
}));

interface SidebarComponentProps {
    showFilters: boolean;
    handleFilterBtnClick: () => void;
    title: string;
}

export const SidebarComponent: React.FC<SidebarComponentProps> = ({
    showFilters,
    handleFilterBtnClick,
    title,
    children,
}) => {
    return (
        <Box
            sx={{
                position: "relative",
                width: showFilters ? "350px" : "50px",
                borderBlockColor: "black",
                transition: "width 0.3s",
            }}
        >
            <Collapse
                in={showFilters}
                orientation="horizontal"
                sx={{ width: "30%", height: "100vh" }}
            >
                <StyledBox
                    sx={{
                        padding: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    <Typography variant="h6" sx={{ alignSelf: "center" }}>
                        {title}
                    </Typography>
                    {children}
                </StyledBox>
            </Collapse>

            <IconButton
                color="primary"
                aria-label="toggle filter"
                onClick={handleFilterBtnClick}
                sx={{
                    zIndex: 1100,
                    position: "fixed", // Changed from absolute to fixed
                    top: "50%",
                    right: showFilters
                        ? "calc(100% - 287px - 24px)"
                        : "calc(100% - 50px - 24px)",
                    transform: "translateY(-50%)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    cursor: "pointer",
                    color: `${backgroundColor}`,
                    ":hover": {
                        backgroundColor: `${primaryColor}`,
                    },
                    backgroundColor: `${primaryColor}`,
                    padding: "0",
                    height: "48px",
                    width: "48px",
                    "&& svg": {
                        fontSize: "xxx-large",
                    },
                }}
            >
                {showFilters ? (
                    <KeyboardArrowLeftRoundedIcon />
                ) : (
                    <KeyboardArrowRightRoundedIcon />
                )}
            </IconButton>

            {!showFilters && (
                <Typography
                    variant="h3"
                    sx={{
                        color: backgroundColor,
                        position: "absolute",
                        top: 0,
                        left: 0,
                        height: "100%",
                        width: "50px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "top",
                        backgroundColor: primaryColor,
                        padding: "50px 0",
                        fontSize: "0.500rem",
                        lineHeight: "1",
                        letterSpacing: "",

                        transform: "rotate(0deg)",
                        writingMode: "vertical-rl",
                    }}
                >
                    {title}
                </Typography>
            )}
        </Box>
    );
};
