import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/system";
import React from "react";
import { AccordionComponent } from "../../../Shared/Accordion.component";
import { EvaluationsPageCardComponent } from "./EvaluationPage-Card.component";
import { Evaluation, EvaluationCategory } from "./Evaluations.model";

export function EvaluationsPageComponent(props: {
    heading: string;
    evaluationsData: Evaluation;
    navButtonComponent: JSX.Element;
    downloadButtonText: string;
}): JSX.Element {
    const theme = useTheme();
    return (
        <Box sx={{ width: "60%", margin: "2em auto" }}>
            <Typography
                variant="h1"
                sx={{
                    marginBottom: "1rem",
                    paddingBottom: "0.5em",
                    fontSize: "3rem",
                    textAlign: "center",
                    fontWeight: "normal",
                    color: theme.palette.primary.main,
                    borderBottom: `1px solid ${theme.palette.primary.main}`,
                }}
            >
                {props.heading}
            </Typography>
            {props.navButtonComponent}
            <div>
                {Object.keys(props.evaluationsData).map((category) => (
                    <div key={`main-category-${category}`}>
                        <Typography
                            sx={{
                                backgroundColor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                                padding: "0.5em",
                                margin: "1em 0",
                            }}
                            id={category}
                        >
                            {
                                props.evaluationsData[
                                    category as EvaluationCategory
                                ].mainTitle
                            }
                        </Typography>
                        <div>
                            {props.evaluationsData[
                                category as EvaluationCategory
                            ].accordions.map((evaluation) => (
                                <AccordionComponent
                                    key={`accordion-${category}-${evaluation.title}`}
                                    title={evaluation.title}
                                    content={
                                        <EvaluationsPageCardComponent
                                            title={evaluation.title}
                                            description={evaluation.description}
                                            chartPath={evaluation.chartPath}
                                            downloadButtonText={
                                                props.downloadButtonText
                                            }
                                        />
                                    }
                                    defaultExpanded={false}
                                    centerContent
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </Box>
    );
}
