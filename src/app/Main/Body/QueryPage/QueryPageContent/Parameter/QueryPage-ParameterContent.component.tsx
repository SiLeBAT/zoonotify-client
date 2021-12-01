/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { ParameterContentListComponent } from "./ParameterContent-List.component";
import { AccordionComponent } from "../../../../../Shared/Accordion.component";
import { FilterInterface } from "../../../../../Shared/Model/Filter.model";
import { subFiltersList } from "../../../../../Shared/Model/Client_Isolate.model";
import { createParameterListService } from "./createParameterList.service";

const parameterBlockStyle = css`
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    flex-grow: 1;
`;

export function QueryPageParameterContentComponent(props: {
    selectedFilter: FilterInterface;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    const selectedFilters = props.selectedFilter;

    /**
     * @desc Creates a ParameterList for each main filter
     * @returns {JSX.Element[]} - List of ParameterList-components
     */
    const createParameterComponent = (): JSX.Element[] => {
        const elements: JSX.Element[] = [];
        Object.keys(selectedFilters).forEach((filterElement) => {
            if (selectedFilters[filterElement].length !== 0) {
                let isSubFilter = false;
                if (subFiltersList.includes(filterElement)){
                    isSubFilter = true;
                }
                let parameterLabel = t(`Filters.${filterElement}`);

                if (isSubFilter) {
                    parameterLabel = t(`Subfilters.${filterElement}.name`);
                }

                const parameterList = createParameterListService(filterElement,
                    selectedFilters[filterElement],
                    t, 
                    isSubFilter)  

                elements.push(
                    <ParameterContentListComponent
                        key={`parameter_list_${filterElement}`}
                        parameterLabel={parameterLabel}
                        parameterValuesList={parameterList}
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
            centerContent={false}
        />
    );
}
