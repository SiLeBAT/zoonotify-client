import { Typography } from "@mui/material";
import React from "react";
// eslint-disable-next-line import/named
import { Theme, useTheme } from "@mui/system";
import { useTranslation } from "react-i18next";
import { ZNAccordion } from "../../shared/components/accordion/ZNAccordion";
import {
    birdSpecies,
    campy,
    campySpp,
    coliShort,
    enteroSpp,
    faecalis,
    faecium,
    salmSpp,
} from "./italicNames.constants";

const subContentDescriptionStyle = {
    marginTop: "0",
    marginBottom: "1em",
    paddingLeft: "1.5em",
    hyphens: "auto",
    textAlign: "justify",
    lineHight: "1.6",
} as const;

function generateContentWithSubContent(
    filterDescription: string,
    describedFiltersContent: Record<string, Record<string, string>>,
    theme: Theme
): JSX.Element {
    const subContent: JSX.Element[] = [];

    for (const describedFilterSubKey of Object.keys(describedFiltersContent)) {
        const subFilter: Record<string, string> =
            describedFiltersContent[describedFilterSubKey];
        const subFilterName = subFilter.Name;

        let descriptionName: string | JSX.Element = subFilterName;
        let descriptionText: string | JSX.Element = subFilter.Description;

        if (
            describedFilterSubKey === "microorganism-6" ||
            describedFilterSubKey === "microorganism-7" ||
            describedFilterSubKey === "microorganism-8"
        ) {
            descriptionName = (
                <span>
                    {subFilter.Subname}
                    <i>{subFilterName}</i>
                    {subFilter.Abbreviation}
                    {coliShort})
                </span>
            );
        } else if (
            describedFilterSubKey === "microorganism-1" ||
            describedFilterSubKey === "microorganism-2" ||
            describedFilterSubKey === "microorganism-3" ||
            describedFilterSubKey === "microorganism-4" ||
            describedFilterSubKey === "microorganism-5" ||
            describedFilterSubKey === "microorganism-9"
        ) {
            descriptionName = (
                <span>
                    {subFilter.Subname}
                    <i>{subFilterName}</i>
                    {subFilter.Abbreviation}
                </span>
            );
        }

        if (describedFilterSubKey === "microorganism-9") {
            descriptionText = (
                <span>
                    {subFilter.Description1}
                    {faecalis}
                    {subFilter.Description2}
                    {faecium}
                    {subFilter.Description3}
                </span>
            );
        } else if (describedFilterSubKey === "category-3") {
            descriptionText = (
                <span>
                    {subFilter.Description1}
                    {birdSpecies.Gallus}
                    {subFilter.Description2}{" "}
                </span>
            );
        }
        subContent.push(
            <Typography
                component="p"
                sx={{
                    marginBottom: "0.25em",
                    color: theme.palette.primary.main,
                }}
                key={`${subFilter.Subname}${subFilterName}-name`}
            >
                {descriptionName}
            </Typography>,
            <Typography
                component="p"
                sx={subContentDescriptionStyle}
                key={`${subFilter.Subname}${subFilterName}-description`}
            >
                {descriptionText}
            </Typography>
        );
    }

    const content: JSX.Element = (
        <div>
            <Typography
                component="p"
                sx={{
                    margin: 0,
                    marginBottom: "1em",
                    hyphens: "auto",
                    textAlign: "justify",
                    lineHeight: "1.6",
                }}
            >
                {filterDescription}
            </Typography>
            {subContent}
        </div>
    );

    return content;
}

export function InfoPageFiltersContentComponent(props: {
    describedFilters: string[];
}): JSX.Element {
    const theme = useTheme();
    const { t } = useTranslation(["InfoPage"]);

    const filterAccordionsList: JSX.Element[] = [];

    for (const describedFilter of props.describedFilters) {
        switch (describedFilter) {
            case "microorganism":
            case "origin":
            case "samplingStage":
            case "category": {
                const describedFiltersContent: Record<
                    string,
                    Record<string, string>
                > = t(`Filters.${describedFilter}.${describedFilter}-types`, {
                    returnObjects: true,
                });
                const filterDescription: string = t(
                    `Filters.${describedFilter}.Description`
                );
                filterAccordionsList.push(
                    <ZNAccordion
                        title={t(`Filters.${describedFilter}.Name`)}
                        content={generateContentWithSubContent(
                            filterDescription,
                            describedFiltersContent,
                            theme
                        )}
                        defaultExpanded={false}
                        centerContent={false}
                        key={`accordion_${describedFilter}`}
                    />
                );

                break;
            }
            case "resistance": {
                const resistanceContent = (
                    <Typography component="p" key="resistance-description">
                        {t("Filters.resistance.Description1")}
                        {salmSpp}, {campySpp},
                        {t("Filters.resistance.Description2")}
                        {coliShort}
                        {t("Filters.resistance.Description3")}
                        {coliShort}
                        {t("Filters.resistance.Description4")}
                        {coliShort}
                        {t("Filters.resistance.Description5")}
                        {enteroSpp}
                        {t("Filters.resistance.Description6")}
                        {campy}
                        {t("Filters.resistance.Description7")}
                    </Typography>
                );

                filterAccordionsList.push(
                    <ZNAccordion
                        title={t(`Filters.resistance.Name`)}
                        content={resistanceContent}
                        defaultExpanded={false}
                        centerContent={false}
                        key="accordion_resistance"
                    />
                );

                break;
            }
            case "samplingContext": {
                filterAccordionsList.push(
                    <ZNAccordion
                        title={t(`Filters.samplingContext.Name`)}
                        content={
                            <div>
                                <Typography
                                    component="p"
                                    sx={{ margin: 0, paddingBottom: "0.5em" }}
                                >
                                    {t(`Filters.samplingContext.Description1`)}
                                </Typography>
                                <Typography component="p" sx={{ margin: 0 }}>
                                    {t(`Filters.samplingContext.Description2`)}
                                </Typography>
                            </div>
                        }
                        defaultExpanded={false}
                        centerContent={false}
                        key="accordion_samplingContext"
                    />
                );

                break;
            }
            default: {
                filterAccordionsList.push(
                    <ZNAccordion
                        title={t(`Filters.${describedFilter}.Name`)}
                        content={
                            <Typography component="p">
                                {t(`Filters.${describedFilter}.Description`)}{" "}
                            </Typography>
                        }
                        defaultExpanded={false}
                        centerContent={false}
                        key={`accordion_${describedFilter}`}
                    />
                );
            }
        }
    }

    return <div>{filterAccordionsList}</div>;
}
