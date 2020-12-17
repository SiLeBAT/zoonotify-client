/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import _ from "lodash";
import { FilterContext } from "../../../../Shared/Context/FilterContext";
import {
    FilterInterface,
    FilterType,
    mainFilterAttributes,
} from "../../../../Shared/Filter.model";
import { ParameterListComponent } from "./Parameter-List.component";

const subHeadingStyle = css`
    margin: 0;
`;
const parameterBlockStyle = css`
    margin-left: 2em;
    width: 100%;
`;

function pairwise(
    arr: FilterType[],
    func: { (current: FilterType, next: FilterType): void }
): void {
    for (let i = 0; i < arr.length; i += 2) {
        func(arr[i], arr[i + 1]);
    }
}

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

    const createParameterComponent = (
        filterAttributes: FilterType[],
        filterValues: FilterInterface
    ): JSX.Element[] => {
        const elements: JSX.Element[] = [];
        pairwise(filterAttributes, (current, next): void => {
            elements.push(
                <ParameterListComponent
                    key={`parameter-list-${current}-${next}`}
                    element1={current}
                    element2={next}
                    listElements1={filterValues[current]}
                    listElements2={filterValues[next]}
                />
            );
        });
        return elements;
    };

    return (
        <Accordion defaultExpanded>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <h3 css={subHeadingStyle}>{t("Results.Parameter")}</h3>
            </AccordionSummary>
            <AccordionDetails>
                <div css={parameterBlockStyle}>
                    {createParameterComponent(
                        mainFilterAttributes,
                        displayFilter
                    )}
                </div>
            </AccordionDetails>
        </Accordion>
    );
}
