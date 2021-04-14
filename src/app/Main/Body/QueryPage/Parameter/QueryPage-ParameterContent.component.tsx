/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { ParameterContentListComponent } from "./ParameterContent-List.component";
import { AccordionComponent } from "../../../../Shared/Accordion.component";
import { FilterInterface } from "../../../../Shared/Model/Filter.model";

const parameterBlockStyle = css`
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    flex-grow: 1;
`;

export function QueryPageParameterContentComponent(props: {
    mainFilterAttributes: string[];
    selectedFilter: FilterInterface;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    const mainFilter = props.mainFilterAttributes
    const {selectedFilter} = props

    const displayFilter: Record<string, string[]> = _.cloneDeep(
        selectedFilter
    );
    mainFilter.forEach((filterElement: string) => {
        if (selectedFilter[filterElement].length === 0) {
            displayFilter[filterElement] = [t("Filters.All")];
        } else {
            displayFilter[filterElement] = selectedFilter[filterElement];
        }
    });

    /**
     * @desc Creates a ParameterList for each main filter
     * @returns {JSX.Element[]} - List of ParameterList-components
     */
    const createParameterComponent = (): JSX.Element[] => {
        const elements: JSX.Element[] = [];
        mainFilter.forEach((element): void => {
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
