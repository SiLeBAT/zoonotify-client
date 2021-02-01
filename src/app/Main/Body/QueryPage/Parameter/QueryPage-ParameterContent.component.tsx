/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import _ from "lodash";
import { FilterContext } from "../../../../Shared/Context/FilterContext";
import { ParameterContentListComponent } from "./ParameterContent-List.component";
import { AccordionComponent } from "../../../../Shared/Accordion.component";

const parameterBlockStyle = css`
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    flex-grow: 1;
`;

export function QueryPageParameterContentComponent(): JSX.Element {
    const { filter } = useContext(FilterContext);
    const { t } = useTranslation(["QueryPage"]);

    const displayFilter: Record<string, string[]> = _.cloneDeep(
        filter.selectedFilter
    );
    filter.mainFilter.forEach((filterElement: string) => {
        if (filter.selectedFilter[filterElement].length === 0) {
            displayFilter[filterElement] = [t("Filters.All")];
        } else {
            displayFilter[filterElement] = filter.selectedFilter[filterElement];
        }
    });

    /**
     * @desc Creates a ParameterList for each main filter
     * @returns {JSX.Element[]} - List of ParameterList-components
     */
    const createParameterComponent = (): JSX.Element[] => {
        const elements: JSX.Element[] = [];
        filter.mainFilter.forEach((element): void => {
            elements.push(
                <ParameterContentListComponent
                    key={`parameter_list_${element}`}
                    element={element}
                    listElements={displayFilter[element]}
                />
            );
        });
        return elements;
    };

    return (
        <AccordionComponent
            title={t("Results.Parameter")}
            content={
                <div css={parameterBlockStyle}>
                    {createParameterComponent()}
                </div>
            }
        />
    );
}
