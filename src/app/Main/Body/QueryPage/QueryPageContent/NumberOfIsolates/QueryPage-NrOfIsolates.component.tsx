/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import { AccordionComponent } from "../../../../../Shared/Accordion.component";

const tableTextStyle = css`
    font-weight: bold;
    padding-right: 1em;
`;
const textStyle = css`
    font-size: 0.75rem;
`;

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
                            <span css={tableTextStyle}>
                                {t("NrOfIsolates.Total")}
                            </span>
                            <span>{props.numberOfIsolates.total}</span>
                        </Grid>
                        {props.filtersAreSelected && [
                            <Grid item xs={3} key="NrOfFilteredIsolates">
                                <span css={tableTextStyle}>
                                    {t("NrOfIsolates.Selected")}
                                </span>
                                <span>{props.numberOfIsolates.filtered}</span>
                            </Grid>,
                            <Grid item xs={2} key="empty">
                                <span>&nbsp;</span>
                            </Grid>,
                            <Grid item xs={3} key="InfoText">
                                <span css={textStyle}>
                                    {t("NrOfIsolates.InfoText")}
                                </span>
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
