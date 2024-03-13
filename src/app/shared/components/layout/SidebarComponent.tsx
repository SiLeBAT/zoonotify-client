import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import { Box, Collapse, IconButton, Typography } from "@mui/material";
import React from "react";
import { backgroundColor, primaryColor } from "../../style/Style-MainTheme";

interface SidebarComponentProps {
    isOpen: boolean;
    handleOpenClick: () => void;
    title: string;
}

export const SidebarComponent: React.FC<SidebarComponentProps> = ({
    isOpen,
    handleOpenClick,
    title,
    children,
}) => {
    return (
        <Collapse
            orientation="horizontal"
            in={isOpen}
            collapsedSize={50}
            sx={{
                maxWidth: "30%",
                borderRight: "1px solid gray",
                "&& .MuiCollapse-wrapperInner": {
                    width: "100%",
                },
            }}
        >
            {isOpen && (
                <>
                    <div
                        style={{
                            zIndex: "101",
                            position: "relative",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                padding: 1,
                                justifyContent: "center",
                                gap: 2,
                            }}
                        >
                            <Typography variant="h3">{title}</Typography>
                        </Box>

                        {children}
                    </div>

                    <div
                        style={{
                            float: "inline-end",
                        }}
                    >
                        <IconButton
                            color="primary"
                            aria-label="apply filter"
                            onClick={handleOpenClick}
                            sx={{
                                zIndex: "100",
                                position: "absolute",
                                top: "45%",
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
                                background: `linear-gradient( 90deg , ${backgroundColor} 50%, ${primaryColor} 50%)`,
                                padding: "0",
                                height: "48px",
                                width: "48px",
                                marginLeft: "-24px",
                                "&& svg": {
                                    marginLeft: "10px",
                                    marginRight: "-10px",
                                    fontSize: "xxx-large",
                                },
                            }}
                        >
                            <KeyboardArrowLeftRoundedIcon />
                        </IconButton>
                    </div>
                </>
            )}
            {!isOpen && (
                <div
                    style={{
                        backgroundColor: `${primaryColor}`,
                        height: "100%",
                    }}
                >
                    <div
                        style={{
                            display: "inline-block",
                            transform: "rotate(-90deg) translateX(-110%)",
                            transformOrigin: "top left",
                            width: "max-content",
                            zIndex: "100",
                            position: "absolute",
                            left: "10px",
                        }}
                    >
                        <Typography
                            variant="h3"
                            sx={{
                                color: `${backgroundColor}`,
                            }}
                        >
                            {title}
                        </Typography>
                    </div>

                    <IconButton
                        color="primary"
                        aria-label="apply filter"
                        onClick={handleOpenClick}
                        sx={{
                            top: "45%",
                            left: "25px",
                            position: "absolute",
                            height: "48px",
                            width: "48px",
                            backgroundColor: `${primaryColor}`,
                            color: "rgb(255, 255, 255)",
                            ":hover": {
                                backgroundColor: `${primaryColor}`,
                            },
                            "&& svg": {
                                marginRight: "-15px",
                                fontSize: "xxx-large",
                            },
                        }}
                    >
                        <KeyboardArrowRightRoundedIcon />
                    </IconButton>
                </div>
            )}
        </Collapse>
    );
};
