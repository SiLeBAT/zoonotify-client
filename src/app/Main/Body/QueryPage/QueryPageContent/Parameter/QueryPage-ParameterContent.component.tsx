/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { ParameterContentListComponent } from "./ParameterContent-List.component";
import { AccordionComponent } from "../../../../../Shared/Accordion.component";
import { FilterInterface } from "../../../../../Shared/Model/Filter.model";
import {
    DbKey,
    MainFilterList,
    subFiltersList,
} from "../../../../../Shared/Model/Client_Isolate.model";
import { createParameterListItemService } from "./createParameterListItem.service";

const parameterBlockStyle = css`
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    flex-grow: 1;
`;

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

            const parameterListItem = createParameterListItemService(
                filterElement,
                selectedFilters[filterElement],
                t,
                isSubFilter
            );

            elements.push(
                <ParameterContentListComponent
                    key={`parameter_list_${filterElement}`}
                    parameterLabel={parameterLabel}
                    parameterValuesList={parameterListItem}
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
