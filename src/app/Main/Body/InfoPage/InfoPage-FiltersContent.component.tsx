/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { AccordionComponent } from "../../../Shared/Accordion.component";
import { primaryColor } from "../../../Shared/Style/Style-MainTheme.component";
import { microorganismNames } from "./InfoPage.model";

const descriptionStyle = css`
    margin: 0;
    hyphens: auto;
    text-align: justify;
`;

const subContentNameStyle = css`
    margin-bottom: 0.25em;
    color: ${primaryColor};
`;
const subContentDescriptionStyle = css`
    margin-top: 0;
    padding-left: 1.5em;
    hyphens: auto;
    text-align: justify;
`;

function generateContentWithSubContent(
    filterDescription: string,
    describedFiltersContent: Record<string, Record<string, string>>
): JSX.Element {
    const subContent: JSX.Element[] = [];

    Object.keys(describedFiltersContent).forEach((describedFilterSubKey) => {
        const subFilter: Record<string, string> =
            describedFiltersContent[describedFilterSubKey];
        const subFilterName = subFilter.Name;
        subContent.push(
            <p css={subContentNameStyle} key={`${subFilter.Subname}${subFilterName}-name`}>
                {subFilter.Subname}
                <i>{subFilterName}</i>
                {subFilter.Abbreviation}
            </p>
        );

        if (describedFilterSubKey === "microorganism-9") {
            subContent.push(
                <p
                    css={subContentDescriptionStyle}
                    key={`${subFilter.Subname}${subFilterName}-description`}
                >
                    {subFilter.Description1}
                    {microorganismNames.Faecalis}
                    {subFilter.Description2}
                    {microorganismNames.Faecium}
                    {subFilter.Description3}
                </p>)
        } else {
        subContent.push(
            <p
                css={subContentDescriptionStyle}
                key={`${subFilter.Subname}${subFilterName}-description`}
            >
                {subFilter.Description}
            </p>
        )}; 
    });

    const content: JSX.Element = (
        <div>
            <p css={descriptionStyle}>{filterDescription}</p>
            {subContent}
        </div>
    );

    return content;
}

export function InfoPageFiltersContentComponent(props: {
    describedFilters: string[];
}): JSX.Element {
    const { t } = useTranslation(["InfoPage"]);

    const filterAccordionsList: JSX.Element[] = [];

    props.describedFilters.forEach((describedFilter) => {
        if (
            describedFilter === "microorganism" ||
            describedFilter === "origin" ||
            describedFilter === "samplingStage" ||
            describedFilter === "category"
        ) {
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
                <AccordionComponent
                    title={t(`Filters.${describedFilter}.Name`)}
                    content={generateContentWithSubContent(
                        filterDescription,
                        describedFiltersContent
                    )}
                    defaultExpanded={false}
                    key={`accordion_${describedFilter}`}
                />
            );
        } else if (describedFilter === "resistance") {
            const resistanceContent = (
                <p
                    css={subContentDescriptionStyle}
                    key="resistance-description"
                >
                    {t("Filters.resistance.Description1")}
                    {microorganismNames.Salm} spp., {microorganismNames.Campy} spp.,
                    {t("Filters.resistance.Description2")}
                    {microorganismNames.ColiShort}
                    {t("Filters.resistance.Description3")}
                    {microorganismNames.ColiShort}
                    {t("Filters.resistance.Description4")}
                    {microorganismNames.ColiShort}
                    {t("Filters.resistance.Description5")}
                    {microorganismNames.Entero} spp.
                    {t("Filters.resistance.Description6")}
                </p>
            );

            filterAccordionsList.push(
                <AccordionComponent
                    title={t(`Filters.resistance.Name`)}
                    content={resistanceContent}
                    defaultExpanded={false}
                    key="accordion_resistance"
                />
            );
        } else if (describedFilter === "samplingContext") {
            filterAccordionsList.push(
                <AccordionComponent
                    title={t(`Filters.samplingContext.Name`)}
                    content={
                        <div>
                            <p>{t(`Filters.samplingContext.Description1`)}</p>
                            <p>{t(`Filters.samplingContext.Description2`)}</p>
                        </div>
                    }
                    defaultExpanded={false}
                    key="accordion_samplingContext"
                />
            );
        } else {
            filterAccordionsList.push(
                <AccordionComponent
                    title={t(`Filters.${describedFilter}.Name`)}
                    content={t(`Filters.${describedFilter}.Description`)}
                    defaultExpanded={false}
                    key={`accordion_${describedFilter}`}
                />
            );
        }
    });

    return <div>{filterAccordionsList}</div>;
}
