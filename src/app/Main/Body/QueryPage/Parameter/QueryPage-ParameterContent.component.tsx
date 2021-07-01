/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { ParameterContentListComponent } from "./ParameterContent-List.component";
import { AccordionComponent } from "../../../../Shared/Accordion.component";
import { FilterInterface } from "../../../../Shared/Model/Filter.model";

const parameterBlockStyle = css`
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    flex-grow: 1;
`;

export function QueryPageParameterContentComponent(props: {
    mainFilterAttributes: string[];
    selectedFilter: FilterInterface;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    const mainFilters = props.mainFilterAttributes;
    const selectedFilters = props.selectedFilter;

    const displayedFilters = new Map<string, string[]>();
    mainFilters.forEach((filterElement: string) => {
        if (selectedFilters[filterElement].length !== 0) {
            displayedFilters.set(filterElement, selectedFilters[filterElement]);
        }
    });

    /**
     * @desc Creates a ParameterList for each main filter
     * @returns {JSX.Element[]} - List of ParameterList-components
     */
    const createParameterComponent = (): JSX.Element[] => {
        const elements: JSX.Element[] = [];
        Object.keys(displayedFilters).forEach((element): void => {
            const listElements = displayedFilters.get(element);
            if (listElements !== undefined) {
                elements.push(
                    <ParameterContentListComponent
                        key={`parameter_list_${element}`}
                        element={element}
                        listElements={listElements}
                    />
                );
            }
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
            defaultExpanded
        />
    );
}
