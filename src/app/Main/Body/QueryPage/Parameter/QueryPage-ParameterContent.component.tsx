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
import { FilterType } from "../../../../Shared/Filter.model";
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

    const displayFilter = _.cloneDeep(filter);
    const filterKeys = Object.keys(filter);
    filterKeys.forEach((element) => {
        const e = element as FilterType;
        if (filter[e].length === 0) {
            displayFilter[e] = [t("Filters.All")];
        } else {
            displayFilter[e] = filter[e];
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
                                filterKeys.forEach((element): void => {
                                    const keyName = element.replace(" ", "_");
                                    const e = element as FilterType;
                                    elements.push(
                                        <ParameterListComponent
                                            key={`parameter-list-${element}`}
                                            label={t(`Filters.${e}`)}
                                            keyName={keyName}
                                            listElements={displayFilter[e]}
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
