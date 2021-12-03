/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { ListItem, ListItemText } from "@mui/material";
import { ParameterListLayout } from "./ParameterList-Layout.component";
import { AccordionComponent } from "../../../../../Shared/Accordion.component";
import {
    FilterInterface,
    FilterType,
} from "../../../../../Shared/Model/Filter.model";
import {
    DbKey,
    MainFilterList,
    subFiltersList,
} from "../../../../../Shared/Model/Client_Isolate.model";
import { getMicroorganismLabelService } from "../../Services/getMicroorganismLabel";
import { replaceAll } from "../../../../../Core/replaceAll.service";

const parameterBlockStyle = css`
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    flex-grow: 1;
`;
const spaceStyle = css`
    padding: 0;
    margin: 0;
`;
const parameterValue = css`
    margin-top: 0;
    margin-left: 2em;
    span {
        letter-spacing: 0;
    }
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
    filterList: DbKey[] | string[],
    selectedFilters: FilterInterface,
    t: TFunction,
    isSubFilter: boolean
): JSX.Element[] {
    const elements: JSX.Element[] = [];
    filterList.forEach((filterElement) => {
        if (selectedFilters[filterElement].length !== 0) {
            let parameterLabel = t(`Filters.${filterElement}`);
            if (isSubFilter) {
                parameterLabel = t(`Subfilters.${filterElement}.name`);
            }

            const listItems: JSX.Element[] = [];
            selectedFilters[filterElement].forEach((parameter) => {
                const parameterListItem = createParameterName(
                    filterElement,
                    parameter,
                    t,
                    isSubFilter
                );
                listItems.push(
                    <ListItem
                        key={`listItem-${parameterListItem.key}`}
                        css={spaceStyle}
                    >
                        <ListItemText
                            id={`labelId-${parameterListItem.key}`}
                            primary={parameterListItem.parameterName}
                            css={parameterValue}
                        />
                    </ListItem>
                );
            });

            elements.push(
                <ParameterListLayout
                    key={`parameter_list_${filterElement}`}
                    parameterLabel={parameterLabel}
                    parameterValuesList={listItems}
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
        MainFilterList,
        selectedFilters,
        t,
        false
    );
    const subFiltersParameterList = createParameterList(
        subFiltersList,
        selectedFilters,
        t,
        true
    );

    const parameterElements = mainFiltersParameterList.concat(
        subFiltersParameterList
    );

    return (
        <AccordionComponent
            title={t("Results.Parameter")}
            content={<div css={parameterBlockStyle}>{parameterElements}</div>}
            defaultExpanded
            centerContent={false}
        />
    );
}
