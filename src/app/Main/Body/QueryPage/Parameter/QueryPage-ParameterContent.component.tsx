/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import _ from "lodash";
import { FilterContext } from "../../../../Shared/Context/FilterContext";
import { mainFilterAttributes } from "../../../../Shared/Filter.model";
import { ParameterListComponent } from "./Parameter-List.component";
import { AccordionComponent as Accordion } from "../../../../Shared/Accordion.component";

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

    const displayFilter = _.cloneDeep(filter);
    mainFilterAttributes.forEach((element) => {
        if (filter[element].length === 0) {
            displayFilter[element] = [t("Filters.All")];
        } else {
            displayFilter[element] = filter[element];
        }
    });

    const createParameterComponent = (): JSX.Element[] => {
        const elements: JSX.Element[] = [];
        mainFilterAttributes.forEach((element): void => {
            elements.push(
                <ParameterListComponent
                    element={element}
                    listElements={displayFilter[element]}
                />
            );
        });
        return elements;
    };

    return (
        <Accordion
            title={t("Results.Parameter")}
            content={
                <div css={parameterBlockStyle}>
                    {createParameterComponent()}
                </div>
            }
        />
    );
}
