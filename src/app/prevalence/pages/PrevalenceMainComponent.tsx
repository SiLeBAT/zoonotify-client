import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import {
    Box,
    // Button,
    // Chip,
    Collapse,
    // Grid,
    IconButton,
    Paper,
    Stack,
    Typography,
    styled,
} from "@mui/material";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MainComponentHeader } from "../../shared/components/MainComponentHeader";
import {
    backgroundColor,
    footerHeight,
    headerHeight,
    primaryColor,
} from "../../shared/style/Style-MainTheme";
import { EvaluationDivisionContainer } from "../components/EvaluationDivisionContainer";
import { FilterContainerComponent } from "../components/FilterContainerComponent";
import { DivisionToken, FilterSelection } from "../model/Evaluations.model";
import { useEvaluationPageComponent } from "./evaluationsUseCases";
// import { useTranslation } from "react-i18next";

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
}));

export function PrevalenceMainComponent(): JSX.Element {
    const { model, operations } = useEvaluationPageComponent();
    const { t } = useTranslation(["ExplanationPage"]);

    const [showFilters, setShowFilters] = React.useState(true);

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
        operations.fetchData(model.selectedFilters);
        setHeightFromTop(getHeightOffset());
    }, []);

    useEffect(() => {
        setHeightFromTop(getHeightOffset());
    }, [model.selectionConfig]);

    const handleFilterBtnClick = (): void => {
        setShowFilters((prev) => !prev);
    };

    const handleSearchBtnClick = (filter: FilterSelection): void => {
        operations.updateFilters(filter);
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
                                    handleSearchBtnClick={handleSearchBtnClick}
                                    howToHeading={model.howToHeading}
                                    howToContent={model.howto}
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
                                heading={model.heading}
                            ></MainComponentHeader>
                        </Box>
                    </Box>
                    <div
                        style={{
                            height: `calc(100vh - ${heightFromTop}px)`,
                            maxHeight: `calc(100vh - ${heightFromTop}px)`,
                            overflowY: "scroll",
                        }}
                    >
                        {!model.loading &&
                            Object.keys(model.evaluationsData)
                                .filter((value) =>
                                    operations.showDivision(value)
                                )
                                .map((division) => (
                                    <EvaluationDivisionContainer
                                        key={division}
                                        title={t(division)} // Updated line
                                        divisionData={
                                            model.evaluationsData[
                                                division as DivisionToken
                                            ]
                                        }
                                        downloadGraphButtonText={
                                            model.downloadGraphButtonText
                                        }
                                        downloadDataButtonText={
                                            model.downloadDataButtonText
                                        }
                                    />
                                ))}
                    </div>
                </Item>
            </Stack>
        </>
    );
}
