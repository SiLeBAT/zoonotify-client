import React from "react";
import { Box, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import { AccordionComponent } from "../../../../../Shared/Accordion.component";

const tableTextStyle = { fontWeight: "bold", paddingRight: "1em" } as const;

export function QueryPageNrOfIsolatesComponent(props: {
    numberOfIsolates: {
        total: number;
        filtered: number;
    };
    filtersAreSelected: boolean;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    return (
        <AccordionComponent
            title={t("NrOfIsolates.Title")}
            content={
                <Box>
                    <Grid container spacing={0.5} columns={5}>
                        <Grid item xs={2}>
                            <Typography component="span" sx={tableTextStyle}>
                                {t("NrOfIsolates.Total")}
                            </Typography>
                            <Typography component="span">
                                {props.numberOfIsolates.total}
                            </Typography>
                        </Grid>
                        {props.filtersAreSelected && [
                            <Grid item xs={3} key="NrOfFilteredIsolates">
                                <Typography
                                    component="span"
                                    sx={tableTextStyle}
                                >
                                    {t("NrOfIsolates.Selected")}
                                </Typography>
                                <Typography component="span">
                                    {props.numberOfIsolates.filtered}
                                </Typography>
                            </Grid>,
                            <Grid item xs={2} key="empty">
                                <Typography component="span">&nbsp;</Typography>
                            </Grid>,
                            <Grid item xs={3} key="InfoText">
                                <Typography sx={{ fontSize: "0.75rem" }}>
                                    {t("NrOfIsolates.InfoText")}
                                </Typography>
                            </Grid>,
                        ]}
                    </Grid>
                </Box>
            }
            defaultExpanded
            centerContent={false}
        />
    );
}
