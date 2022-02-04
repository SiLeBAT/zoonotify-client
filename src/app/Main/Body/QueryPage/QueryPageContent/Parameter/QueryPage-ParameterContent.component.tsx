/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { Divider } from "@mui/material";
import { ParameterListLayout } from "./ParameterList-Layout.component";
import { AccordionComponent } from "../../../../../Shared/Accordion.component";
import {
    FilterInterface,
    FilterType,
} from "../../../../../Shared/Model/Filter.model";
import { getMicroorganismLabelService } from "../../Services/getMicroorganismLabel";
import { replaceAll } from "../../../../../Core/replaceAll.service";

const parameterBlockStyle = css`
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    flex-grow: 1;
`;

function createParameterName(
    parameterAttribute: FilterType,
    parameter: string,
    t: TFunction,
    isSubFilter: boolean
): { parameterName: string | JSX.Element; key: string } {
    const key = parameter.replace(".", "");
    let parameterName: string | JSX.Element = "";
    if (parameterAttribute === "microorganism") {
        const translateRootString = `FilterValues.formattedMicroorganisms.${key}`;
        const prefix = t(`${translateRootString}.prefix`);
        const name = t(`${translateRootString}.name`);
        const italicName = t(`${translateRootString}.italicName`);
        const suffix = t(`${translateRootString}.suffix`);
        parameterName = getMicroorganismLabelService({
            prefix,
            name,
            italicName,
            suffix,
        });
    } else if (isSubFilter) {
        parameterName = t(
            `Subfilters.${parameterAttribute}.values.${replaceAll(
                parameter,
                ".",
                "-"
            )}`
        );
    } else {
        parameterName = t(`FilterValues.${parameterAttribute}.${key}`);
    }

    return { parameterName, key };
}

function createParameterList(
    selectedFilters: Record<FilterType, string[]>,
    t: TFunction,
    isSubFilter: boolean
): JSX.Element[] {
    const elements: JSX.Element[] = [];
    Object.keys(selectedFilters).forEach((filterElement) => {
        if (selectedFilters[filterElement].length !== 0) {
            const filterElementForTranslation = replaceAll(
                filterElement,
                ".",
                ""
            );
            let parameterLabel = t(`Filters.${filterElementForTranslation}`);
            if (isSubFilter) {
                parameterLabel = `${t(
                    `Subfilters.${filterElementForTranslation}.name`
                )} - ${t(`Subfilters.${filterElementForTranslation}.trigger`)}`;
            }

            const parameterNames: {
                parameterName: string | JSX.Element;
                key: string;
            }[] = [];
            selectedFilters[filterElement].forEach((parameter) => {
                const parameterName = createParameterName(
                    filterElementForTranslation,
                    parameter,
                    t,
                    isSubFilter
                );
                parameterNames.push(parameterName);
            });

            elements.push(
                <ParameterListLayout
                    key={`parameter_list_${filterElement}`}
                    parameterLabel={parameterLabel}
                    parameterNames={parameterNames}
                />
            );
        }
    });
    return elements;
}

export function QueryPageParameterContentComponent(props: {
    selectedFilter: FilterInterface;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    const selectedFilters = props.selectedFilter;

    const mainFiltersParameterList = createParameterList(
        selectedFilters.filters,
        t,
        false
    );
    const subFiltersParameterList = createParameterList(
        selectedFilters.subfilters,
        t,
        true
    );

    return (
        <AccordionComponent
            title={t("Results.Parameter")}
            content={
                <div>
                    <div css={parameterBlockStyle}>
                        {mainFiltersParameterList}
                    </div>
                    <Divider />
                    <div css={parameterBlockStyle}>
                        {subFiltersParameterList}
                    </div>
                </div>
            }
            defaultExpanded
            centerContent={false}
        />
    );
}
