import {
    Box,
    Chip,
    Collapse,
    Grid,
    IconButton,
    Paper,
    Stack,
    styled,
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import React, { useEffect } from "react";
import { MainComponentHeader } from "../../shared/components/MainComponentHeader";
import { EvaluationDivisionContainer } from "../components/EvaluationDivisionContainer";
import { FilterContainerComponent } from "../components/FilterContainerComponent";
import { DivisionToken, FilterSelection } from "../model/Evaluations.model";
import { useEvaluationPageComponent } from "./evaluationsUseCases";
import { useTranslation } from "react-i18next";

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
}));

export function EvaluationsMainComponent(): JSX.Element {
    const { model, operations } = useEvaluationPageComponent(null);
    const { t } = useTranslation(["ExplanationPage"]);
    const handleChipDelete = (label: string, index: number): void => {
        const result = model.selectionConfig.filter((config) => {
            return config.label == label;
        });
        if (result && result.length > 0) {
            if (index > -1) {
                const dataCopy = JSON.parse(
                    JSON.stringify(result[0].selectedItems)
                );
                dataCopy.splice(index, 1);
                result[0].handleChange({
                    target: { value: dataCopy.toString() },
                });
            } else {
                result[0].handleChange({ target: { value: "" } });
            }
        }
    };
    const [showFilters, setShowFilters] = React.useState(false);

    const handleFilterBtnClick = (): void => {
        setShowFilters((prev) => !prev);
    };

    const handleSearchBtnClick = (filter: FilterSelection): void => {
        operations.fetchData(filter);
    };

    useEffect(() => {
        operations.fetchData(model.selectedFilters);
    }, []); // No dependency, will only run once

    return (
        <>
            <Box sx={{ width: "60%", margin: "2em auto" }}>
                <MainComponentHeader
                    heading={model.heading.main}
                ></MainComponentHeader>
            </Box>
            <Grid container spacing={2}>
                <Grid
                    item
                    xs={12}
                    md={12}
                    sx={{
                        display: "inline",
                        float: "right",
                    }}
                >
                    {model.selectionConfig.map((config, index) => {
                        if (
                            config &&
                            config.selectedItems &&
                            config.selectedItems.length > 0 &&
                            config.selectionOptions &&
                            config.selectionOptions.length > 0
                        ) {
                            if (
                                config.selectedItems.length ==
                                config.selectionOptions.length
                            ) {
                                return (
                                    <Chip
                                        key={`Chip` + index}
                                        sx={{ margin: "3px !important" }}
                                        color="warning"
                                        variant="filled"
                                        label={config.label + ": All"}
                                        onDelete={() =>
                                            handleChipDelete(config.label, -1)
                                        }
                                    />
                                );
                            }
                            return config.selectedItems.map(
                                (item, itemIndex) => {
                                    if (item)
                                        return (
                                            <Chip
                                                key={
                                                    `Chip` +
                                                    index +
                                                    "_" +
                                                    itemIndex
                                                }
                                                sx={{
                                                    margin: "3px !important",
                                                }}
                                                color="warning"
                                                variant="filled"
                                                label={
                                                    config.label +
                                                    ": " +
                                                    t(item)
                                                }
                                                onDelete={() =>
                                                    handleChipDelete(
                                                        config.label,
                                                        itemIndex
                                                    )
                                                }
                                            />
                                        );
                                    else return;
                                }
                            );
                        }
                        return;
                    })}
                </Grid>
            </Grid>

            <Stack direction="row" spacing={2}>
                <Collapse
                    orientation="horizontal"
                    in={showFilters}
                    collapsedSize={40}
                    sx={{
                        maxWidth: "30%",
                        height: "75vh",
                        "&& .MuiCollapse-wrapperInner": {
                            width: "100%",
                        },
                    }}
                >
                    {showFilters && (
                        <>
                            <Stack direction="row" spacing={2}>
                                <div style={{ height: "auto", width: "95%" }}>
                                    <FilterContainerComponent
                                        selectionConfig={model.selectionConfig}
                                        searchButtonText={
                                            model.searchButtonText
                                        }
                                        handleSearchBtnClick={(
                                            data: FilterSelection
                                        ) => {
                                            handleSearchBtnClick(data);
                                        }}
                                    />
                                </div>
                                <div
                                    style={{
                                        height: "auto",
                                        width: "5%",
                                        margin: 0,
                                    }}
                                >
                                    <IconButton
                                        color="primary"
                                        aria-label="apply filter"
                                        onClick={handleFilterBtnClick}
                                        sx={{
                                            position: "relative !important",
                                            top: "calc(50% - 10px) !important",
                                        }}
                                    >
                                        <FilterAltIcon />
                                    </IconButton>
                                </div>
                            </Stack>
                        </>
                    )}
                    {!showFilters && (
                        <IconButton
                            color="primary"
                            aria-label="apply filter"
                            onClick={handleFilterBtnClick}
                            sx={{
                                position: "relative",
                                top: "calc(50% - 10px)",
                            }}
                        >
                            <FilterAltIcon />
                        </IconButton>
                    )}
                </Collapse>

                <Item style={{ height: "auto", width: "100%" }}>
                    <div>
                        {Object.keys(model.evaluationsData)
                            .filter((value) => operations.showDivision(value))
                            .map((division) => (
                                <EvaluationDivisionContainer
                                    key={division}
                                    title={model.heading[division]}
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
                                ></EvaluationDivisionContainer>
                            ))}
                    </div>
                </Item>
            </Stack>
        </>
    );
}
