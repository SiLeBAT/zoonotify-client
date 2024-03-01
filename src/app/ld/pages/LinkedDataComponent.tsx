import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import { MainComponentHeader } from "../../shared/components/MainComponentHeader";

import {
    Box,
    CircularProgress,
    Collapse,
    IconButton,
    Paper,
    Stack,
    Typography,
    styled,
} from "@mui/material";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    backgroundColor,
    footerHeight,
    headerHeight,
    primaryColor,
} from "../../shared/style/Style-MainTheme";
import { FilterContainerComponent } from "../components/FilterContainerComponent";
import { JSONViewer } from "../components/JSONViewerComponent";
import { FilterSelection } from "../model/LinkedData.model";
import { useLinkedDataPageComponent } from "./LinkedDataUseCases";

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
}));

export function LinkedDataComponent(): JSX.Element {
    const { model, operations } = useLinkedDataPageComponent(null);
    const { t } = useTranslation(["ExplanationPage"]);

    const [showFilters, setShowFilters] = React.useState(true);
    const [dataFetched, setDataFetched] = React.useState(false);
    const [notFound, setNotFound] = React.useState(false);
    const [view, setView] = React.useState("LD");

    const handleFilterBtnClick = (): void => {
        setShowFilters((prev) => !prev);
    };

    const handleSearchBtnClick = (filter: FilterSelection): void => {
        operations.fetchData(filter, view);
        setDataFetched(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const headerRef: any = React.createRef();
    const [heightFromTop, setHeightFromTop] = React.useState(230);

    const getHeightOffset = (): number => {
        if (headerRef?.current?.clientHeight) {
            return (
                headerRef?.current?.clientHeight +
                Number(footerHeight) +
                Number(headerHeight) +
                18
            );
        }
        return 230;
    };

    useEffect(() => {
        setHeightFromTop(getHeightOffset());
    }, []); // No dependency, will only run once

    useEffect(() => {
        setHeightFromTop(getHeightOffset());
        if (dataFetched == true) {
            if (model.data.length == 0) {
                setNotFound(true);
            } else {
                setNotFound(false);
            }
        }
    }, [model.selectionConfig]);

    const fetch = (viewName: string): void => {
        setView(viewName);
        operations.fetchData(model.selectedFilters, viewName);
        setDataFetched(true);
    };

    return (
        <>
            <Stack
                direction="row"
                spacing={2}
                sx={{
                    "&& .MuiPaper-root": {},
                }}
            >
                <Collapse
                    orientation="horizontal"
                    in={showFilters}
                    collapsedSize={50}
                    sx={{
                        maxWidth: "30%",
                        borderRight: "1px solid gray",
                        "&& .MuiCollapse-wrapperInner": {
                            width: "100%",
                        },
                    }}
                >
                    {showFilters && (
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
                                    <Typography variant="h3">
                                        {t("Filter_Settings")}
                                    </Typography>
                                </Box>

                                <FilterContainerComponent
                                    selectionConfig={model.selectionConfig}
                                    searchButtonText={model.searchButtonText}
                                    loading={model.loading}
                                    handleSearchBtnClick={(
                                        data: FilterSelection
                                    ) => {
                                        handleSearchBtnClick(data);
                                    }}
                                />
                            </div>

                            <div
                                style={{
                                    float: "inline-end",
                                }}
                            >
                                <IconButton
                                    color="primary"
                                    aria-label="apply filter"
                                    onClick={handleFilterBtnClick}
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
                    {!showFilters && (
                        <div
                            style={{
                                backgroundColor: `${primaryColor}`,
                                height: "100%",
                            }}
                        >
                            <div
                                style={{
                                    display: "inline-block",
                                    transform:
                                        "rotate(-90deg) translateX(-110%)",
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
                                    {t("Filter_Settings")}
                                </Typography>
                            </div>

                            <IconButton
                                color="primary"
                                aria-label="apply filter"
                                onClick={handleFilterBtnClick}
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

                <Item
                    style={{
                        width: "100%",
                        boxShadow: "15px 0 15px -15px inset",
                    }}
                >
                    <Box ref={headerRef}>
                        <Box>
                            <MainComponentHeader
                                heading={model.heading.main}
                            ></MainComponentHeader>
                        </Box>
                    </Box>
                    <div
                        style={{
                            height: `calc(100vh - ${heightFromTop}px)`,
                            maxHeight: `calc(100vh - ${heightFromTop}px)`,
                            overflowY: "auto",
                        }}
                    >
                        {model.loading ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    position: "relative",
                                    left: "0",
                                    top: "50%",
                                    zIndex: "9999",
                                }}
                            >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <JSONViewer
                                data={model.data}
                                fetch={fetch}
                                view={view}
                                notfound={notFound ? "true" : "false"}
                            />
                        )}
                    </div>
                </Item>
            </Stack>
        </>
    );
}
