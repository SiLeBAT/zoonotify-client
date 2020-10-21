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
import { ParameterListComponent } from "./Parameter-List.component";

const subHeadingStyle = css`
    margin: 0;
`;
const parameterBlockStyle = css`
    margin-left: 2em;
`;

export function QueryPageParameterContentComponent(): JSX.Element {
    const { filter } = useContext(FilterContext);
    const { t } = useTranslation(["QueryPage"]);

    const displayFilter = _.cloneDeep(filter.selectedFilter);
    filter.mainFilter.forEach((element) => {
        if (!_.isEmpty(filter.selectedFilter)) {
            if (filter.selectedFilter[element].length === 0 ) {
                displayFilter[element] = [t("Filters.All")];
            } else {
                displayFilter[element] = filter.selectedFilter[element];
            }
        } else {
            displayFilter[element] = [t("Filters.All")];
        }
        
    });

    return (
        <div>
            <Accordion defaultExpanded>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <h3 css={subHeadingStyle}>{t("Results.Parameter")}</h3>
                </AccordionSummary>
                <AccordionDetails>
                    <table css={parameterBlockStyle}>
                        <tbody>
                            {(function AddParameterElement(): JSX.Element[] {
                                const elements: JSX.Element[] = [];
                                filter.mainFilter.forEach((element): void => {
                                    const keyName = element.replace(" ", "_");
                                    elements.push(
                                        <ParameterListComponent
                                            key={`parameter-list-${element}`}
                                            label={t(`Filters.${element}`)}
                                            keyName={keyName}
                                            listElements={displayFilter[element]}
                                        />
                                    );
                                });
                                return elements;
                            })()}
                        </tbody>
                    </table>
                </AccordionDetails>
            </Accordion>
        </div>
    );
}
